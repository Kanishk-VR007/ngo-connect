try {
    require('./backend/controllers/donationController');
    require('./backend/controllers/ngoController');
    require('./backend/controllers/requestController');
    require('./backend/controllers/analyticsController');
    require('./backend/controllers/chatController');
    require('./backend/controllers/authController');
    require('./backend/controllers/eventController');
    require('./backend/controllers/eventRequestController');
    console.log('SUCCESS: All controllers loaded OK - no syntax errors');
} catch (e) {
    console.error('ERROR:', e.message);
    process.exit(1);
}
