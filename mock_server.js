var express = require('express')
var app = express()

app.get('/instructors', function(req, res) { 
    console.log(req.query);
    var user = { 
        id: 'MOCKID',
        team_id: 'MOCKTEAMID',
        name: 'mock_user_name',
        deleted: false,
        status: null,
        real_name: '',
        profile: 
           { 
            real_name: 'Joe Mock',
            real_name_normalized: 'joe mock',
            email: 'mock_user_email@gmail.com',
            is_admin: false,
            is_owner: false,
            is_primary_owner: false,
            is_restricted: false,
            is_ultra_restricted: false,
            is_bot: false 
        };

    if (req.query.name){
        res.send(user);
    }else if (req.query.email){
        res.send(user);
    }
})

app.put('/instructors/:slug', function(req, res) { 
    res.send('ok'); 
})

app.listen(4000, function() { 
    console.log('mock api server listening on port 4000'); 
})