$(function() {
    warnOfUnsavedChanges();
    stopEnterFromSubmitting();
    markFieldErrors();
//     // Hides blank error message as soon as text is entered into username
//     $('#id_username').on("input", function() {
//         hideError('username', 'blank');
//     })

    // /* Calls an Ajax function in user_form_base.js to check if username is in 
    // use, which then calls usernameTakenLiveCheck here with the results */
    // function usernameTakenLiveCheck(hasUsernameBeenTaken) {
    //     if (hasUsernameBeenTaken) {
    //         showError('username', 'taken');
    //     } else {
    //         hideError('username', 'taken');
    //     }
    // }
//     $('#id_username').blur(function() {
//         isFieldTaken($(this).val(), 'username', usernameTakenLiveCheck);
//     });

//     /* Similar to checking to see if the username has been taken, except this
//     also checks if the email is valid (which also warns for blank emails) */
//     function emailTakenLiveCheck(hasEmailBeenTaken) {
//         if (hasEmailBeenTaken) {
//             showError('email', 'taken');
//         } else {
//             hideError('email', 'taken');
//         }
//     }
//     $('#id_email').blur(function() {
//         emailString = $(this).val();
//         if (isValidEmail(emailString)) {
//             hideError('email', 'invalid');
//         } else {
//             showError('email', 'invalid');
//         }
//         isFieldTaken(emailString, 'email', emailTakenLiveCheck);
//     });

});
