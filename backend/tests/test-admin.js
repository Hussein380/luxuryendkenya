// Native fetch is available in Node.js 18+, no need for node-fetch requirement.

const testAdmin = async () => {
    const baseUrl = 'http://localhost:5000/api';

    try {
        console.log('--- Phase 6: Admin Dashboard Verification ---');

        // 1. Create/Login as Admin
        console.log('\n1. Logging in as Admin...');
        const loginRes = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@driveease.com',
                password: 'adminPassword123'
            })
        });

        const authData = await loginRes.json();

        if (!authData.success) {
            console.log('Admin not found, creating one...');
            const regRes = await fetch(`${baseUrl}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'System Admin',
                    email: 'admin@driveease.com',
                    password: 'adminPassword123',
                    role: 'admin'
                })
            });
            const regData = await regRes.json();
            if (!regData.success) throw new Error('Failed to create admin');
            var token = regData.data.token;
        } else {
            console.log('✅ Admin login successful');
            var token = authData.data.token;
        }

        // 2. Fetch Dashboard Stats
        console.log('\n2. Fetching Dashboard Stats...');
        const statsRes = await fetch(`${baseUrl}/admin/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const statsData = await statsRes.json();

        if (statsData.success) {
            console.log('✅ Stats retrieved successfully:');
            console.log(`- Total Revenue: $${statsData.data.totalRevenue}`);
            console.log(`- Total Bookings: ${statsData.data.totalBookings}`);
            console.log(`- Active Bookings: ${statsData.data.activeBookings}`);
            console.log(`- Fleet Size: ${statsData.data.totalCars} (${statsData.data.availableCars} available)`);
            console.log(`- Recent Bookings High-level: Found ${statsData.data.recentBookings.length} bookings`);
        } else {
            throw new Error(`Failed to fetch stats: ${statsData.error}`);
        }

        // 3. Test Location Management
        console.log('\n3. Testing Location Management...');
        const locRes = await fetch(`${baseUrl}/admin/locations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: 'Test Airport Station',
                address: '123 Runway Ave',
                city: 'Test City'
            })
        });
        const locData = await locRes.json();
        if (!locData.success) throw new Error('Location creation failed');
        const locId = locData.data._id;
        console.log('✅ Location created');

        const updateRes = await fetch(`${baseUrl}/admin/locations/${locId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ city: 'Updated City' })
        });
        if ((await updateRes.json()).success) console.log('✅ Location updated');

        const delRes = await fetch(`${baseUrl}/admin/locations/${locId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if ((await delRes.json()).success) console.log('✅ Location deactivated');

        // 4. Test Unauthorized Access (Security Audit)
        console.log('\n4. Testing Security (Non-admin access)...');
        // Create a regular user
        const userRes = await fetch(`${baseUrl}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Regular User',
                email: `user_${Date.now()}@example.com`,
                password: 'password123'
            })
        });
        const userData = await userRes.json();
        const userToken = userData.data.token;

        const unauthorizedRes = await fetch(`${baseUrl}/admin/stats`, {
            headers: { 'Authorization': `Bearer ${userToken}` }
        });

        if (unauthorizedRes.status === 403) {
            console.log('✅ Security check passed: Non-admin access rejected with 403');
        } else {
            throw new Error('Security check failed: Non-admin was allowed access');
        }

        console.log('\n🌟 Phase 6: Admin Dashboard Tests Passed!');
    } catch (error) {
        console.error('\n❌ Admin Verification Failed!');
        console.error(error.message);
        process.exit(1);
    }
};

testAdmin();
