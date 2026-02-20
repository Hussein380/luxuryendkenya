const Booking = require('../models/Booking');
const { sendSuccess, sendError } = require('../utils/response');
const PDFDocument = require('pdfkit');
const LOGO_URL = process.env.LOGO_URL || 'https://soltravel.com/logo.png';

/**
 * @desc    Get revenue data for date range
 * @route   GET /api/admin/revenue
 * @access  Private/Admin
 */
exports.getRevenue = async (req, res) => {
    try {
        const { startDate, endDate, groupBy = 'day' } = req.query;

        // Build date filter
        const dateFilter = {};
        if (startDate || endDate) {
            dateFilter.createdAt = {};
            if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
            if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
        }

        // Get all bookings in date range
        const bookings = await Booking.find(dateFilter).lean();

        // Calculate revenue metrics
        const metrics = calculateRevenueMetrics(bookings);

        // Group data by period
        const groupedData = groupRevenueByPeriod(bookings, groupBy);

        sendSuccess(res, {
            summary: metrics,
            data: groupedData,
            period: groupBy,
            dateRange: {
                start: startDate || 'all time',
                end: endDate || 'all time'
            }
        }, 'Revenue data retrieved successfully');
    } catch (error) {
        sendError(res, error.message, 500);
    }
};

/**
 * Calculate comprehensive revenue metrics
 */
function calculateRevenueMetrics(bookings) {
    let expectedRevenue = 0;        // All non-cancelled bookings (projected)
    let collectedRevenue = 0;       // Actually paid (paid + completed)
    let pendingCollection = 0;      // Confirmed but not paid
    let lostRevenue = 0;            // Cancelled bookings
    let penaltyRevenue = 0;         // Penalty fees collected

    bookings.forEach(booking => {
        const totalPrice = booking.totalPrice || 0;
        const penaltyAmount = booking.penaltyFee?.amount || 0;
        const isPenaltyPaid = booking.penaltyFee?.status === 'paid';

        switch (booking.status) {
            case 'paid':
            case 'completed':
                expectedRevenue += totalPrice;
                collectedRevenue += totalPrice;
                if (isPenaltyPaid) {
                    penaltyRevenue += penaltyAmount;
                    collectedRevenue += penaltyAmount;
                }
                break;
            case 'confirmed':
            case 'active':
            case 'overdue':
                expectedRevenue += totalPrice;
                pendingCollection += totalPrice;
                if (isPenaltyPaid) {
                    penaltyRevenue += penaltyAmount;
                    collectedRevenue += penaltyAmount;
                    pendingCollection -= penaltyAmount; // Adjust since penalty is paid
                }
                break;
            case 'pending':
            case 'reserved':
                expectedRevenue += totalPrice;
                break;
            case 'cancelled':
                lostRevenue += totalPrice;
                break;
        }
    });

    return {
        expectedRevenue,                           // Projected: All non-cancelled
        collectedRevenue,                          // Actual: Money in hand
        pendingCollection,                         // Outstanding: Yet to be paid
        lostRevenue,                               // Cancelled: Lost opportunities
        penaltyRevenue,                            // Extra fees collected
        totalBookings: bookings.length,
        cancelledBookings: bookings.filter(b => b.status === 'cancelled').length,
        completedBookings: bookings.filter(b => b.status === 'completed').length,
        collectionRate: expectedRevenue > 0 
            ? ((collectedRevenue / expectedRevenue) * 100).toFixed(1) 
            : 0
    };
}

/**
 * Group bookings by time period for charting
 */
function groupRevenueByPeriod(bookings, groupBy) {
    const grouped = {};

    bookings.forEach(booking => {
        const date = new Date(booking.createdAt);
        let key;

        switch (groupBy) {
            case 'week':
                const weekStart = new Date(date);
                weekStart.setDate(date.getDate() - date.getDay());
                key = weekStart.toISOString().split('T')[0];
                break;
            case 'month':
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                break;
            case 'year':
                key = `${date.getFullYear()}`;
                break;
            case 'day':
            default:
                key = date.toISOString().split('T')[0];
                break;
        }

        if (!grouped[key]) {
            grouped[key] = {
                period: key,
                expectedRevenue: 0,
                collectedRevenue: 0,
                pendingCollection: 0,
                lostRevenue: 0,
                penaltyRevenue: 0,
                bookingCount: 0,
                cancelledCount: 0
            };
        }

        const totalPrice = booking.totalPrice || 0;
        const penaltyAmount = booking.penaltyFee?.amount || 0;
        const isPenaltyPaid = booking.penaltyFee?.status === 'paid';

        grouped[key].bookingCount++;

        switch (booking.status) {
            case 'paid':
            case 'completed':
                grouped[key].expectedRevenue += totalPrice;
                grouped[key].collectedRevenue += totalPrice;
                if (isPenaltyPaid) {
                    grouped[key].penaltyRevenue += penaltyAmount;
                    grouped[key].collectedRevenue += penaltyAmount;
                }
                break;
            case 'confirmed':
            case 'active':
            case 'overdue':
                grouped[key].expectedRevenue += totalPrice;
                grouped[key].pendingCollection += totalPrice;
                if (isPenaltyPaid) {
                    grouped[key].penaltyRevenue += penaltyAmount;
                    grouped[key].collectedRevenue += penaltyAmount;
                }
                break;
            case 'pending':
            case 'reserved':
                grouped[key].expectedRevenue += totalPrice;
                break;
            case 'cancelled':
                grouped[key].lostRevenue += totalPrice;
                grouped[key].cancelledCount++;
                break;
        }
    });

    // Convert to array and sort by period
    return Object.values(grouped).sort((a, b) => a.period.localeCompare(b.period));
}

/**
 * @desc    Export revenue data as CSV
 * @route   GET /api/admin/revenue/export/csv
 * @access  Private/Admin
 */
exports.exportRevenueCSV = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const dateFilter = {};
        if (startDate || endDate) {
            dateFilter.createdAt = {};
            if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
            if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
        }

        const bookings = await Booking.find(dateFilter)
            .populate('car', 'name brand model')
            .lean();

        // Helper to safely get customer name
        const getCustomerName = (b) => {
            const first = b.firstName || b.customerName?.split(' ')[0] || 'Guest';
            const last = b.lastName || b.customerName?.split(' ').slice(1).join(' ') || '';
            return `${first} ${last}`.trim();
        };

        // Helper to safely get car name
        const getCarName = (b) => {
            if (b.car?.name) return `${b.car.brand || ''} ${b.car.name}`.trim();
            if (b.carName) return b.carName;
            return 'Unknown Car';
        };

        // Helper to format date consistently
        const formatDate = (date) => {
            return new Date(date).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        };

        // Helper to format currency
        const formatCurrency = (amount) => {
            return `KES ${(amount || 0).toLocaleString('en-KE')}`;
        };

        // Create CSV with proper escaping
        const escapeCsv = (value) => {
            const str = String(value || '');
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        // Headers - Accountant-friendly revenue ledger
        const headers = [
            'Date',
            'Booking ID',
            'Customer',
            'Car',
            'Status',
            'Total Amount (KES)',
            'Amount Paid (KES)',
            'Balance (KES)'
        ].map(escapeCsv).join(',');

        const rows = bookings.map(b => {
            const amountPaid = ['paid', 'completed'].includes(b.status) 
                ? b.totalPrice 
                : (b.penaltyFee?.status === 'paid' ? b.penaltyFee.amount : 0);
            
            const balance = b.totalPrice - amountPaid;
            
            return [
                formatDate(b.createdAt),
                escapeCsv(b.bookingId),
                escapeCsv(getCustomerName(b)),
                escapeCsv(getCarName(b)),
                escapeCsv(b.status),
                formatCurrency(b.totalPrice),
                formatCurrency(amountPaid),
                formatCurrency(balance)
            ].join(',');
        });

        // Add BOM for Excel UTF-8 support
        const csv = '\uFEFF' + [headers, ...rows].join('\n');

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=revenue-${startDate || 'all'}-to-${endDate || 'all'}.csv`);
        res.send(csv);
    } catch (error) {
        sendError(res, error.message, 500);
    }
};

/**
 * @desc    Export revenue report as PDF
 * @route   GET /api/admin/revenue/export/pdf
 * @access  Private/Admin
 */
exports.exportRevenuePDF = async (req, res) => {
    try {
        const { startDate, endDate, includeDetails = 'true' } = req.query;
        const showDetails = includeDetails === 'true';

        const dateFilter = {};
        if (startDate || endDate) {
            dateFilter.createdAt = {};
            if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
            if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
        }

        const bookings = await Booking.find(dateFilter).lean();
        const metrics = calculateRevenueMetrics(bookings);

        // Create PDF
        const doc = new PDFDocument({ margin: 50 });
        
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=revenue-report-${startDate || 'all'}-to-${endDate || 'all'}.pdf`);
        
        // Pipe PDF to response
        doc.pipe(res);

        // Helper function to add header on each page
        const addHeader = (pageNum, totalPages) => {
            // Logo placeholder (text-based since we can't easily fetch images)
            doc.fontSize(20).font('Helvetica-Bold').fillColor('#1e3a5f').text('🚗 SOL TRAVEL GROUP', 50, 40);
            doc.fontSize(12).font('Helvetica').fillColor('#666666').text('Premium Car Rentals in Kenya', 50, 65);
            
            // Report title
            doc.fontSize(18).font('Helvetica-Bold').fillColor('#333333').text('Revenue Report', 50, 95);
            
            // Date range
            const dateRangeText = startDate && endDate 
                ? `${new Date(startDate).toLocaleDateString('en-KE')} - ${new Date(endDate).toLocaleDateString('en-KE')}`
                : 'All Time';
            doc.fontSize(10).font('Helvetica').fillColor('#666666').text(`Period: ${dateRangeText}`, 50, 120);
            doc.text(`Generated: ${new Date().toLocaleString('en-KE')}   |   Page ${pageNum} of ${totalPages}`, 50, 135);
            
            // Line separator
            doc.moveTo(50, 155).lineTo(550, 155).stroke('#1e3a5f');
        };

        // Calculate total pages estimate
        const rowsPerPage = 35;
        const totalPages = showDetails ? Math.ceil(bookings.length / rowsPerPage) + 1 : 1;
        let currentPage = 1;

        // First page header
        addHeader(currentPage, totalPages);

        // Summary Section - 6 Key Metrics in 2x3 Grid Layout
        doc.fontSize(16).font('Helvetica-Bold').fillColor('#333333').text('Financial Summary', 50, 175);
        
        const summaryMetrics = [
            { label: 'Expected Revenue', sublabel: '(Projected)', value: `KES ${metrics.expectedRevenue.toLocaleString()}`, color: '#2563eb' },
            { label: 'Collected Revenue', sublabel: '(Actual)', value: `KES ${metrics.collectedRevenue.toLocaleString()}`, color: '#16a34a' },
            { label: 'Pending Collection', sublabel: '(Outstanding)', value: `KES ${metrics.pendingCollection.toLocaleString()}`, color: '#ca8a04' },
            { label: 'Collection Rate', sublabel: '(% Collected)', value: `${metrics.collectionRate}%`, color: '#9333ea' },
            { label: 'Total Bookings', sublabel: '(All bookings)', value: metrics.totalBookings.toString(), color: '#0891b2' },
            { label: 'Lost Revenue', sublabel: '(Cancelled)', value: `KES ${metrics.lostRevenue.toLocaleString()}`, color: '#dc2626' }
        ];

        let y = 210;
        const boxWidth = 240;
        const boxHeight = 70;
        
        summaryMetrics.forEach((metric, index) => {
            const col = index % 2;
            const row = Math.floor(index / 2);
            const x = 50 + (col * (boxWidth + 20));
            const boxY = y + (row * (boxHeight + 15));
            
            // Draw box
            doc.rect(x, boxY, boxWidth, boxHeight).stroke('#e5e7eb').fill('#f9fafb');
            
            // Label
            doc.fontSize(10).font('Helvetica').fillColor('#6b7280').text(metric.label, x + 10, boxY + 10);
            doc.fontSize(8).fillColor('#9ca3af').text(metric.sublabel, x + 10, boxY + 24);
            
            // Value
            doc.fontSize(16).font('Helvetica-Bold').fillColor(metric.color).text(metric.value, x + 10, boxY + 40);
        });

        y = 210 + (3 * (boxHeight + 15)) + 20;

        // Only show booking details if requested
        if (showDetails && bookings.length > 0) {
            // Add new page if needed
            if (y > 600) {
                doc.addPage();
                currentPage++;
                addHeader(currentPage, totalPages);
                y = 175;
            }

            // Line separator
            doc.moveTo(50, y).lineTo(550, y).stroke('#e5e7eb');
            y += 20;

            // Bookings Detail Table Header
            doc.fontSize(14).font('Helvetica-Bold').fillColor('#333333').text('Booking Details', 50, y);
            y += 25;

            // Table headers
            const headers = ['Date', 'Booking ID', 'Customer', 'Status', 'Amount'];
            const colWidths = [70, 110, 130, 90, 100];
            let x = 50;

            doc.fontSize(9).font('Helvetica-Bold').fillColor('#374151');
            headers.forEach((header, i) => {
                doc.text(header, x, y);
                x += colWidths[i];
            });

            y += 18;
            doc.moveTo(50, y - 5).lineTo(550, y - 5).stroke('#d1d5db');

            // Table rows
            doc.font('Helvetica').fontSize(8).fillColor('#4b5563');
            
            bookings.forEach((booking, index) => {
                // Add new page if needed
                if (y > 700) {
                    doc.addPage();
                    currentPage++;
                    addHeader(currentPage, totalPages);
                    y = 175;
                    
                    // Redraw table headers on new page
                    x = 50;
                    doc.fontSize(9).font('Helvetica-Bold').fillColor('#374151');
                    headers.forEach((header, i) => {
                        doc.text(header, x, y);
                        x += colWidths[i];
                    });
                    y += 18;
                    doc.moveTo(50, y - 5).lineTo(550, y - 5).stroke('#d1d5db');
                    doc.font('Helvetica').fontSize(8).fillColor('#4b5563');
                }

                x = 50;
                const statusColors = {
                    paid: '#16a34a',
                    completed: '#0891b2',
                    confirmed: '#2563eb',
                    active: '#7c3aed',
                    pending: '#ca8a04',
                    reserved: '#ea580c',
                    cancelled: '#dc2626',
                    overdue: '#dc2626'
                };
                
                const rowData = [
                    new Date(booking.createdAt).toLocaleDateString('en-KE'),
                    booking.bookingId,
                    `${booking.firstName} ${booking.lastName}`.substring(0, 20),
                    booking.status,
                    `KES ${booking.totalPrice.toLocaleString()}`
                ];

                rowData.forEach((cell, i) => {
                    if (i === 3) { // Status column with color
                        doc.fillColor(statusColors[booking.status] || '#6b7280');
                    } else {
                        doc.fillColor('#4b5563');
                    }
                    doc.text(cell, x, y);
                    x += colWidths[i];
                });

                y += 16;
            });
        }

        // Footer on last page
        doc.fontSize(8).font('Helvetica').fillColor('#9ca3af').text(
            '© Sol Travel Group - Confidential Report - Internal Use Only',
            50,
            doc.page.height - 50,
            { align: 'center', width: 500 }
        );

        doc.end();
    } catch (error) {
        sendError(res, error.message, 500);
    }
};
