$(function() {
    warnOfUnsavedChanges();
    stopEnterFromSubmitting();

    var childElementSelector = 'input,select,textarea,label,div,p,a';

    // Makes a copy of the last form and erases all the fields
    formCloner = function(form) {
        var template = $(form).clone(true),
            insertionRow = $('.insertion-row:first').clone(true)
        template.find(childElementSelector).each(function() {
            var elem = $(this);
            if (elem.is('input:checkbox') || elem.is('input:radio')) {
                elem.attr('checked', false);
            } else {
                elem.val('');
            }
        });
        return template;
    }

    var itemTypes = ['entry', 'divider', 'image'],
        itemsClassList = '.entry,.divider,.image',
        itemNamesUpper = {}, totalItems = {}, maxItems = {}, itemTemplates = {}
    for (itemType of itemTypes) {
        itemNamesUpper[itemType] = itemType.charAt(0).toUpperCase() + itemType.slice(1)
        totalItems[itemType] = $('#id_' + itemType + '-TOTAL_FORMS')
        maxItems[itemType] = $('#id_' + itemType + '-MAX_NUM_FORMS').val()
        itemTemplates[itemType] = formCloner($('.' + itemType + ':last'))
    }
    maxItemsMessageStart = 'Each timeline can have a maximum of ',
    maxItemsMessages = {
        'entry': maxItemsMessageStart + maxItems['entry'] + ' entries.',
        'divider': maxItemsMessageStart + maxItems['divider'] + ' dividers.',
        'image': maxItemsMessageStart + maxItems['image'] + ' images.'
    }
    fieldToGetNameFrom = {
        'entry': 'name',
        'divider': 'name',
        'image': 'caption'
    }

$(document).ready(function() {
    /* This is a bit of a hack, but in order to have blank forms to make copies 
    of, we have to set formset extra to 1, but that changes the formset's 
    management_form to think that there's one more form than there actually is, 
    which causes an error when saving. This changes the value of TOTAL_FORMS to 
    avoid that problem. */
    for (itemType of itemTypes) {
        $('#id_' + itemType + '-TOTAL_FORMS').val($('#id_' + itemType + '-INITIAL_FORMS').val());
    }

    /* When timeline-edit gets reloaded because of an error, this function 
    makes sure that the items marked for deletion remain appropriately hidden */
    $(itemsClassList).each(function() {
        if ($(this).find('[name$="DELETE"]').is(':checked')) {
            var button = $(this).find('[id$="delete-button"]'),
                itemType = button.attr('class').split('-')[1],
                formCount = parseInt(totalItems[itemType].val());
            deleteItem(button, itemType, formCount, 0)
        }
    })
        
})

// /* These functions monitor the page in real time to display warnings if
// there's a problem with what the user has entered */
//     // Checks if timeline has a title
//     $('#id_title, #id_description').blur(function() {
//         if ($('#id_title').val()) {
//             hideError('title', 'blank');
//         } else {
//             showError('title', 'blank');
//         } 
//     })

//     // Adds/removes warning for entry names if other fields are/aren't filled
//     $('[id^="id_entry"]').blur(function() {
//         var itemNumber = getItemNumber($(this)),
//             itemType = 'entry';
//         if (isNameMissing(itemNumber, itemType)) {
//             showError('name', 'blank', itemNumber, itemType);
//         } else {
//             hideError('name', 'blank', itemNumber, itemType);
//         } 
//     });

//     // Hides error message as soon as text is entered into title/names
//     $('#id_title').on("input", function() {
//         hideError('title', 'blank');
//     })
//     $('input[name$="name"]').on("input", function() {
//         var itemNumber = getItemNumber($(this)),
//             itemType = getItemType($(this));
//         hideError('name', 'blank', itemNumber, itemType);
//     })

//     // Checks if description/comments are too long
//     $('#id_description').on("input", function() {
//         if (isTextFieldTooLong($(this))) {
//             showError('description', 'length');
//         } else {
//             hideError('description', 'length');
//         }
//     });
//     $('textarea[name$="comment"]').on("input", function() {
//         var itemNumber = getItemNumber($(this)),
//             itemType = getItemType($(this));
//         if (isTextFieldTooLong($(this))) {
//             showError('comment', 'length', itemNumber, itemType);
//         } else {
//             hideError('comment', 'length', itemNumber, itemType);
//         }
//     });

//     // Checks if links are valid URLs
//     $('[name$="link"]').blur(function() {
//         var itemNumber = getItemNumber($(this)),
//             urlString = $(this).val();
//         if (urlString === '' || isValidUrl(urlString)) {
//             hideError('link', 'invalid', itemNumber, 'entry');
//         } else {
//             showError('link', 'invalid', itemNumber, 'entry');
//         }
//     });

    // function for image forms with comments but no image

/* This function collects all the errors on a given timeline and stops the
user from posting if there are any. If there aren't any errors, it removes the
deleted entries, and gets the remaining entries ready to send to Django. */
    
    $('form.timeline-edit-form').submit(function(e) {
        /* This function moves the newly inserted items to the end of the
        formset, since Django wants formsets to have the old ones with IDs first
        and the new ones without IDs at the end or it will cause an error. Bit
        of a hack to do it in JS, but probably the least bad solution. */
        updatePositions();
        $(itemsClassList).each(function() {
            if ($(this).find('[name$="id"]').val() == '') {
                $(this).appendTo($('.formset'))
            }
        })
        updateItems();
    })
//         var hasErrors = false,
//             alertText = 'Please fix the following problems with your timeline:'

        // if (!$('#id_title').val()) {
        //     showError('title', 'blank')
        //     hasErrors = true;
        //     alertText += "\n- Each timeline needs a title";
        // }

        // if (isTextFieldTooLong($('#id_description'))) {
        //     showError('description', 'length')
        //     hasErrors = true;
        //     alertText += "\n- The timeline's description is too long";
        // }

        // $('input[id^="id_entry"][id$="name"]').each(function() {
        //     var itemNumber = getItemNumber($(this));
        //     if (isNameMissing(itemNumber, 'entry')) {
        //         showError('name', 'blank', itemNumber, 'entry');
        //         hasErrors = true;
        //         alertText += '\n- Some entries are missing names';
        //         return false;
        //     }
        // }); 

        // $('[name$="link"]').each(function() {
        //     var urlString = $(this).val();
        //     if (urlString != '' && !isValidUrl(urlString)) {
        //         var itemNumber = getItemNumber($(this));
        //         showError('link', 'invalid', itemNumber);
        //         hasErrors = true;
        //         alertText += '\n- Some links contain invalid URLs';
        //         return false;
        //     }
        // })

        // $('textarea[id^="id_entry"][id$="comment"]').each(function() {
        //     if (isTextFieldTooLong($(this))) {
        //         var itemNumber = getItemNumber($(this));
        //         showError('comment', 'length', itemNumber, 'entry')
        //         hasErrors = true;
        //         alertText += "\n- Some entries' comments are too long";
        //         return false;
        //     }
        // });

        // $('textarea[id^="id_divider"][id$="comment"]').each(function() {
        //     if (isTextFieldTooLong($(this))) {
        //         var itemNumber = getItemNumber($(this));
        //         showError('comment', 'length', itemNumber, 'divider')
        //         hasErrors = true;
        //         alertText += "\n- Some dividers' comments are too long";
        //         return false;
        //     }
        // });

        // function for image forms with comments but no image

        // if (hasErrors) {
        //     alert(alertText);
        //     e.preventDefault();
        // } else {
        //     // $('.entry:hidden,.divider:hidden,.image:hidden').remove();
        //     // updateItems();
        // }

    // });

/* These functions let you insert and delete timeline items as needed on
timeline-edit. Based partly on github.com/elo80ka/django-dynamic-formset */
    

    // Updates the attributes of each timeline item to match its new position
    updateItems = function() {
        for (itemType of itemTypes) {
            $('.' + itemType).each(function(index) {
                updateItemsRegex($(this), index, itemType)
                $(this).find(childElementSelector).each(function() {                
                    updateItemsRegex($(this), index, itemType)
                })
            })
            $("[class='" + itemType + "-header-text']:visible").each(function(index) {
                $(this).text(itemNamesUpper[itemType] + ' ' + (index + 1) + '/' + maxItems[itemType]);
            });
            
            // broken
            // $('.' + itemType + ':visible').each(function(index){
            //     $(this).find('[name$="ORDER"]').val(index + 1);
            // });
        }
    }

    // Handles the find and replace for updateItems
    updateItemsRegex = function(item, index, itemType) {
        var idRegex = new RegExp(itemType + '-(\\d+|__prefix__)-'),
            replacement = itemType + '-' + index + '-';
        if (item.attr("for")) {
            item.attr("for", item.attr("for").replace(idRegex, replacement));
        }
        if (item.attr('id')) {
            item.attr('id', item.attr('id').replace(idRegex, replacement));
        }
        if (item.attr('name')) {
            item.attr('name', item.attr('name').replace(idRegex, replacement));
        }
    }

    /* updatePositions has to be kept separate from updateItems because when
    the form is submitted the new forms get moved to the end of the formset but
    their position has to NOT be updated. */
    updatePositions = function() {
        $(itemsClassList).each(function(index) {
            $(this).children('[name$="position"]').val(index)
        });
    }

    $(document).on('click', 'a[class^="delete"],a[class^="undelete"],a[class^="insert"]', function() {
        var button = $(this),
            action = button.attr('class').split('-')[0],
            itemType = button.attr('class').split('-')[1],
            formCount = parseInt(totalItems[itemType].val())
        if (action === 'delete') {
            deleteItem(button, itemType, formCount)
        } else if (action === 'undelete') {
            undeleteItem(button, itemType, formCount)
        } else if (action === 'insert') {
            insertItem(button, itemType, formCount)
        }
    })

    function deleteItem(button, itemType, formCount, fadeOutTime=500) {
        var itemNumber = getItemNumber(button)
        deletedName = $('#id_' + itemType + '-' + itemNumber + '-' + 
            fieldToGetNameFrom[itemType]).val();
        if (deletedName.length > 30) {
            deletedName = deletedVal.slice(0,25) + '...'
        }
        undoDeleteText = '<p><a class="undelete-' + itemType + '" id="id_' + 
            itemType + '-' + itemNumber + '-undelete" ' +
            'href="javascript:void(0)"> Undo Delete ' + itemNamesUpper[itemType] + 
            '</a> - "' + deletedName + '"</p>'

        $('#id_' + itemType + '-' + itemNumber + '-DELETE').prop("checked", true)
        $('.user-form').addClass('changed-input');
        
        var parentForm = button.parent()
        parentForm.fadeOut(fadeOutTime, function() { 
            parentForm.after(undoDeleteText);
            updateItems();
            updatePositions();
        });
    }
    
    function undeleteItem(button, itemType, formCount) {
        var itemNumber = getItemNumber(button)
        if (maxItems[itemType] <= formCount) {
            alert(maxItemsMessages[itemType]);
        } else {
            $('#id_' + itemType + '-' + itemNumber + '-DELETE').prop("checked", false)
            button.parent().prev().fadeIn(1000);
            button.parent().remove();
            totalItems[itemType].val(formCount + 1);
            updateItems();
            updatePositions();
        }
    };

    function insertItem(button, itemType, formCount) {
        templateCopy = itemTemplates[itemType].clone(true);
        if (maxItems[itemType] <= formCount) {
            alert(maxItemsMessages[itemType]);
        } else {
            if (button.is('[class$="at-start"]')) {
                $('.formset').prepend(templateCopy);
            } else {
                button.parent().after(templateCopy);
            }
            templateCopy.hide().fadeIn(1000);
            totalItems[itemType].val(formCount + 1);
            updateItems();
            updatePositions();
        };
    }

//Calls on jquery.swap.js to swap non-hidden items in the TL
    $(document).on('click', 'a[id$="down"],a[id$="up"]', function() {
        var itemNumber = getItemNumber($(this)),
            itemType = getItemType($(this)),
            parentForm = $('#id_' + itemType + '-' + itemNumber + '-div');
        if ($(this).is('[id$="down"]')) {
            var swapPartners = parentForm.nextAll().filter("div:visible");
        } else {
            var swapPartners = parentForm.prevAll().filter("div:visible");
        }
        itemToSwapWith = swapPartners.first();
        if (itemToSwapWith.length) {
            parentForm.swap(itemToSwapWith)
        }
    })
});