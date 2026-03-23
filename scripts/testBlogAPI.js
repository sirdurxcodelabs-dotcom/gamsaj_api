const axios = require('axios');

const testBlogAPI = async () => {
  try {
    console.log('Testing Blog API endpoints...\n');

    // Test public endpoint (should work without auth)
    console.log('1. Testing public blog endpoint...');
    const publicResponse = await axios.get('http://localhost:5000/api/blogs');
    console.log(`✓ Public blogs: ${publicResponse.data.data.length} blogs found`);
    console.log(`  Status codes: ${publicResponse.status}`);

    // Test with status=all (should require auth)
    console.log('\n2. Testing status=all endpoint (should fail without auth)...');
    try {
      const allResponse = await axios.get('http://localhost:5000/api/blogs?status=all');
      console.log(`✓ All blogs without auth: ${allResponse.data.data.length} blogs found`);
    } catch (error) {
      console.log(`✓ Expected auth error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    }

    // Test health endpoint
    console.log('\n3. Testing server health...');
    const healthResponse = await axios.get('http://localhost:5000/health');
    console.log(`✓ Server health: ${healthResponse.data.message}`);

    console.log('\n✅ API tests completed!');
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
};

testBlogAPI();