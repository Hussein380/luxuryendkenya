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
            .populate('car', 'name brand')
            .lean();

        // Create CSV content
        const headers = [
            'Date',
            'Booking ID',
            'Customer',
            'Car',
            'Status',
            'Total Price',
            'Penalty Fee',
            'Amount Paid',
            'Payment Status'
        ].join(',');

        const rows = bookings.map(b => {
            const amountPaid = ['paid', 'completed'].includes(b.status) 
                ? b.totalPrice 
                : (b.penaltyFee?.status === 'paid' ? b.penaltyFee.amount : 0);
            
            return [
                new Date(b.createdAt).toLocaleDateString('en-KE'),
                b.bookingId,
                `"${b.firstName} ${b.lastName}"`,
                `"${b.car?.name || 'N/A'}"`,
                b.status,
                b.totalPrice,
                b.penaltyFee?.amount || 0,
                amountPaid,
                b.status === 'cancelled' ? 'Cancelled' : 
                    (amountPaid >= b.totalPrice ? 'Fully Paid' : 
                        (amountPaid > 0 ? 'Partial' : 'Unpaid'))
            ].join(',');
        });

        const csv = [headers, ...rows].join('\n');

        res.setHeader('Content-Type', 'text/csv');
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
        const { startDate, endDate } = req.query;

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

        // Header
        doc.fontSize(24).font('Helvetica-Bold').text('SOL TRAVEL GROUP', 50, 50);
        doc.fontSize(14).font('Helvetica').text('Revenue Report', 50, 80);
        
        // Date range
        const dateRangeText = startDate && endDate 
            ? `${new Date(startDate).toLocaleDateString('en-KE')} - ${new Date(endDate).toLocaleDateString('en-KE')}`
            : 'All Time';
        doc.fontSize(10).text(`Period: ${dateRangeText}`, 50, 100);
        doc.text(`Generated: ${new Date().toLocaleString('en-KE')}`, 50, 115);

        // Line separator
        doc.moveTo(50, 135).lineTo(550, 135).stroke();

        // Summary Section
        doc.fontSize(16).font('Helvetica-Bold').text('Summary', 50, 155);
        
        const summaryData = [
            ['Expected Revenue (Projected):', `KES ${metrics.expectedRevenue.toLocaleString()}`],
            ['Collected Revenue (Actual):', `KES ${metrics.collectedRevenue.toLocaleString()}`],
            ['Pending Collection:', `KES ${metrics.pendingCollection.toLocaleString()}`],
            ['Lost Revenue (Cancelled):', `KES ${metrics.lostRevenue.toLocaleString()}`],
            ['Penalty Revenue:', `KES ${metrics.penaltyRevenue.toLocaleString()}`],
            ['Collection Rate:', `${metrics.collectionRate}%`],
            ['Total Bookings:', metrics.totalBookings.toString()],
            ['Completed:', metrics.completedBookings.toString()],
            ['Cancelled:', metrics.cancelledBookings.toString()]
        ];

        let y = 180;
        summaryData.forEach(([label, value]) => {
            doc.fontSize(10).font('Helvetica').text(label, 50, y);
            doc.font('Helvetica-Bold').text(value, 250, y);
            y += 18;
        });

        // Line separator
        doc.moveTo(50, y + 10).lineTo(550, y + 10).stroke();

        // Bookings Detail Table
        y += 30;
        doc.fontSize(16).font('Helvetica-Bold').text('Booking Details', 50, y);
        y += 25;

        // Table headers
        const headers = ['Date', 'Booking ID', 'Customer', 'Status', 'Amount'];
        const colWidths = [70, 100, 120, 80, 80];
        let x = 50;

        doc.fontSize(9).font('Helvetica-Bold');
        headers.forEach((header, i) => {
            doc.text(header, x, y);
            x += colWidths[i];
        });

        y += 15;
        doc.moveTo(50, y).lineTo(550, y).stroke();
        y += 10;

        // Table rows
        doc.font('Helvetica').fontSize(8);
        bookings.slice(0, 50).forEach((booking) => { // Limit to 50 rows for PDF
            if (y > 700) { // New page if needed
                doc.addPage();
                y = 50;
            }

            x = 50;
            const rowData = [
                new Date(booking.createdAt).toLocaleDateString('en-KE'),
                booking.bookingId,
                `${booking.firstName} ${booking.lastName}`.substring(0, 18),
                booking.status,
                `KES ${booking.totalPrice.toLocaleString()}`
            ];

            rowData.forEach((cell, i) => {
                doc.text(cell, x, y);
                x += colWidths[i];
            });

            y += 14;
        });

        // Footer
        doc.fontSize(8).font('Helvetica').text(
            '© Sol Travel Group - Confidential Report',
            50,
            doc.page.height - 50,
            { align: 'center' }
        );

        doc.end();
    } catch (error) {
        sendError(res, error.message, 500);
    }
};
