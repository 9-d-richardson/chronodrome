// Warns if the feedback is too long and prevents the form from submitting
$(function() {
    warnOfUnsavedChanges();
    markFieldErrors();
    
    $('#id_feedback_text').on("input", function() {
        if (isTextFieldTooLong($(this))) {
            showError('feedback_text', 'length');
        } else {
            hideError('feedback_text', 'length');
        }
    });

    $('form').submit(function(e) {
        if (isTextFieldTooLong($('#id_feedback_text'))) {
            e.preventDefault();
            showError('feedback_text', 'length');
        }
    });
});