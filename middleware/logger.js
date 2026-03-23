const logger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  console.log('\n📥 INCOMING REQUEST:');
  console.log(`   Method: ${req.method}`);
  console.log(`   Path: ${req.path}`);
  console.log(`   Time: ${new Date().toLocaleString()}`);
  
  // Only log body if it exists and has content
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    console.log('   Body:', JSON.stringify(req.body, null, 2));
  }

  // Capture the original res.json to log response
  const originalJson = res.json.bind(res);
  
  res.json = function (data) {
    const duration = Date.now() - start;
    
    // Log response
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('\n✅ SUCCESS RESPONSE:');
    } else {
      console.log('\n❌ ERROR RESPONSE:');
    }
    
    console.log(`   Status: ${res.statusCode}`);
    console.log(`   Duration: ${duration}ms`);
    console.log(`   Response:`, JSON.stringify(data, null, 2));
    console.log('─'.repeat(80));
    
    return originalJson(data);
  };

  next();
};

module.exports = logger;
