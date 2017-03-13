const api = require("../../api");

function check_name(user, name_options, bot) {
    const [name_to_check, ...remaining] = name_options;
    if (name_to_check) {
        api
            .users
            .getInstructorByName(name_to_check)
            .then(function(response) {
                    handle_response(response, user, remaining);
                }, 
                function(err) {
                    console.log('Error in promise');
                });
    } else {
        no_instructor_found(user, bot);
    }
}

function handle_response(response, user, name_options, bot){
    const instructor = response.data[0];
    if (instructor) {
        console.log(`Found person by using ${name_to_check} which is name option ${iterator}.`);
        handle_instructor(instructor, user);
    } else {
        check_name(user, name_options, bot);
    }     
}

function no_instructor_found(user, bot){
    console.log('No instructor found by email or name. Notify admin.');
    ask_user_for_email(user, bot);
}

function ask_user_for_email(user, bot){
    //TODO let's implement this, need feedback 
    bot.say({
        text: `Hello! We did not find an Egghead instructor account for ${user.name} based on email or name.`,
        channel: process.env.ADMIN_CHANNEL 
    });
}

function handle_instructor(instructor, user){
    // TODO let's also save the instructor.slug onto the user object in redis
    // will be quick, and will let us easily update the user from other functions.
    
    api
        .users
        .updateInstructor(instructor.slug, {slack_id: user.id})
        .then(result => {
            console.log(`${user.profile.real_name_normalized} has the slack id ${user.slack_id} and the email address ${user.profile.email}`);
        })
}

function searchByNames(user, bot){
    const name_options = [
        user.profile.real_name_normalized,
        user.name,
        user.profile.first_name,
        user.profile.last_name
    ];

    check_name(user, name_options, bot);
}

module.exports = function(controller) {
    console.log('[email_confirmation]', 'applying');

    controller.on('user_channel_join', (bot, message) => {
        console.log('User has joined channel');
        //console.log(message);
        bot.api.users.info({
            user: message.user
        }, (error, {user}) => {

            user = {
                profile: {
                    real_name_normalized: '',
                    first_name: '',
                    last_name: '',
                    email: ''
                },
                slack_id: user.id,
                name: 'alwaysdefined'
            }

            //const slack_id = user.id;
            if (user.profile.email){
                api
                    .users
                    .getInstructorByEmail(user.profile.email)
                    .then(response => {
                        var instructor = response.data[0];
                        if (!instructor) {
                            searchByNames(user);
                        } else {
                            console.log('Found person by email');
                            handle_instructor(instructor, user);
                        }
                    })
                    .catch(error => {
                        console.log(error);
                        // do something here if it failed
                    });
            }else{
                console.log('no email address');
                searchByNames(user, bot);
            }
        });
    });
};
