const testCars = async () => {
    const baseUrl = 'http://localhost:5000/api/cars';

    try {
        console.log('1. Testing GET /api/cars (All Cars)...');
        const resAll = await fetch(baseUrl);
        const dataAll = await resAll.json();
        console.log(`Found ${dataAll.data.cars.length} cars.`);
        if (dataAll.data.cars.length === 0) throw new Error('No cars found');

        console.log('\n2. Testing Filter: category=suv...');
        const resFilter = await fetch(`${baseUrl}?category=suv`);
        const dataFilter = await resFilter.json();
        console.log(`Found ${dataFilter.data.cars.length} SUVs.`);
        if (dataFilter.data.cars[0].category !== 'suv') throw new Error('Filter failed');

        console.log('\n3. Testing Search: Tesla...');
        const resSearch = await fetch(`${baseUrl}?search=Tesla`);
        const dataSearch = await resSearch.json();
        console.log(`Found ${dataSearch.data.cars.length} matches for "Tesla".`);
        if (!dataSearch.data.cars[0].name.includes('Tesla')) throw new Error('Search failed');

        console.log('\n4. Testing GET /api/cars/locations...');
        const resLoc = await fetch(`${baseUrl}/locations`);
        const dataLoc = await resLoc.json();
        console.log('Locations:', dataLoc.data);
        if (!Array.isArray(dataLoc.data)) throw new Error('Locations should be an array');

        console.log('\n✅ Car API Tests Passed!');
    } catch (error) {
        console.error('\n❌ Car API Tests Failed!');
        console.error(error.message);
        process.exit(1);
    }
};

testCars();
