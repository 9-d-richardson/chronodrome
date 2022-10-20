$(function() {
    warnOfUnsavedChanges();
    stopEnterFromSubmitting();
    markFieldErrors();

/* These functions monitor the page in real time to display warnings if
there's a problem with what the user has entered */
    // Checks if timeline has a title
//     $('#id_title, #id_description, #id_import_form').blur(function() {
//         if ($('#id_title').val()) {
//             hideError('title', 'blank');
//         } else {
//             showError('title', 'blank');
//         } 
//     })

//     // Hides error message as soon as text is entered into title
//     $('#id_title').on("input", function() {
//         hideError('title', 'blank');
//     })

//     // Checks if description is too long
//     $('#id_description').on("input", function() {
//         if (isTextFieldTooLong($(this))) {
//             showError('description', 'length');
//         } else {
//             hideError('description', 'length');
//         }
//     });

//     // Checks if import form has too many non-blank lines
//     $('#id_import_form').blur(function() {
//         if (tooManyLines($(this))) {
//             showError('import_form', 'lines');
//         } else {
//             hideError('import_form', 'lines');
//         }
//     });
});