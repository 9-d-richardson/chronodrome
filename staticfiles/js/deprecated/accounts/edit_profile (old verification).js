$(function() {
    warnOfUnsavedChanges();
    markFieldErrors();
    
    // Checks if username is blank
    // $('#id_username,#id_description,#id_email,#id_password').blur(function() {
    //     if ($('#id_username').val()) {
    //         hideError('username', 'blank');
    //     } else {
    //         showError('username', 'blank');
    //     } 
    // })

    // // Hides blank error message as soon as text is entered into username
    // $('#id_username').on("input", function() {
    //     hideError('username', 'blank');
    // })

    // /* If the username has been changed, it calls an Ajax function in
    // user_form_base.js to check if it's in use, which then calls 
    // usernameTakenLiveCheck here with the results */
    // function usernameTakenLiveCheck(hasUsernameBeenTaken) {
    //     if (hasUsernameBeenTaken) {
    //         showError('username', 'taken');
    //     } else {
    //         hideError('username', 'taken');
    //     }
    // }
    // $('#id_username').blur(function() {
    //     usernameString = $(this).val();
    //     if (usernameString === startingUsername) {
    //         hideError('username', 'taken')
    //     } else {
    //         isFieldTaken(usernameString, 'username', usernameTakenLiveCheck);
    //     }     
    // });

    //  Similar to checking to see if the username has been taken, except this
    // also checks if the email is valid (which also warns for blank emails) 
    // function emailTakenLiveCheck(hasEmailBeenTaken) {
    //     if (hasEmailBeenTaken) {
    //         showError('email', 'taken');
    //     } else {
    //         hideError('email', 'taken');
    //     }
    // }
    // $('#id_email').blur(function() {
    //     emailString = $(this).val();
    //     if (isValidEmail(emailString)) {
    //         hideError('email', 'invalid');
    //     } else {
    //         showError('email', 'invalid');
    //     }
    //     if (emailString != startingEmail) {
    //         isFieldTaken(emailString, 'email', emailTakenLiveCheck);
    //     }
    // });

    // // Checks if description is too long
    // $('#id_description').on("input", function() {
    //     if (isTextFieldTooLong($(this))) {
    //         showError('description', 'length');
    //     } else {
    //         hideError('description', 'length');
    //     }
    // });

    // // Warns if password field is blank
    // $('#id_password').blur(function() {
    //     if ($(this).val().length === 0) {
    //         showError('password', 'blank')
    //     }
    //     else {
    //         hideError('password', 'blank')
    //     }
    // });
});
