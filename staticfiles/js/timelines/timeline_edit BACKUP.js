$(function() {
	/* Mostly automatically creates the variables associated with each item type
	for all the other functions to work with */
	var itemTypes = ['entry', 'divider', 'image'],
		itemsClassList = '.entry,.divider,.image',
		itemNamesUpper = {}, totalItems = {}, maxItems = {}, itemTemplates = {}
	for (itemType of itemTypes) {
		itemNamesUpper[itemType] = itemType.charAt(0).toUpperCase() + itemType.slice(1)
		totalItems[itemType] = $('#id_' + itemType + '-TOTAL_FORMS')
		maxItems[itemType] = $('#id_' + itemType + '-MAX_NUM_FORMS').val()
		itemTemplates[itemType] = $('.' + itemType + ':last').clone(true)
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

	itemNamesUpper['ep'] = "Episode"
	totalItems['ep'] = 0 //PLACEHOLDER
	maxItems['ep'] = 100 // PLACEHOLDER
	itemTemplates['ep'] = $('.episode:last').clone(true)
	maxItemsMessages['ep'] = 'Each entry can have a maximum of ' + 
		maxItems['ep'] + ' episodes.'
	fieldToGetNameFrom['ep'] = 'name'	
	
	// itemTemplates['importEpisodes'] = $('.import-episodes:last').clone(true)

/*Removes images that have been prepared for upload. Will have to rewrite this
a bit if we make the form more complicated with extra divs. */
	$(document).on('click', 'button.remove-image', function(e) {
		e.preventDefault();
		$(this).siblings('input[type="file"]').val(null);
	});
			
/* These functions let you insert and delete timeline items as needed on
timeline-edit. Based partly on github.com/elo80ka/django-dynamic-formset */
	// Updates the attributes of each timeline item to match its new position
	updateItems = function() {
		/* Updates the indexing for each type of items, then changes the header 
		numbering but only for the visible items */
		for (itemType of itemTypes) {
			$('.' + itemType).each(function(index) {
				updateAttributes($(this), index, itemType)
			})
			$("." + itemType + "-header-text:visible").each(function(index) {
				updateHeader($(this), index, itemType)
			});
		}
		//Does the same thing as above but for each entry's episodes
		$('.entry').each(function() {
			$(this).find('.episode').each(function(index) {
				updateAttributes($(this), index, 'ep')
			})
			$(this).find('.ep-header-text:visible').each(function(index) {
				updateHeader($(this), index, 'ep')
			})
		})

		// Handles the Regex for updating each item's attributes
		function updateAttributes(item, index, itemType) {
			var idRegex = new RegExp(itemType + '-(\\d+|__prefix__)-'),
				replacement = itemType + '-' + index + '-';
			item.find('*').addBack().each(function() {
				if ($(this).attr("for")) {
					$(this).attr("for", $(this).attr("for").replace(idRegex, replacement));
				}
				if ($(this).attr('id')) {
					$(this).attr('id', $(this).attr('id').replace(idRegex, replacement));
				}
				if ($(this).attr('name')) {
					$(this).attr('name', $(this).attr('name').replace(idRegex, replacement));
				}
			})
		}

		//Changes the numbering for only the visible headers
		function updateHeader(header, index, itemType) {
			header.text(itemNamesUpper[itemType] + ' ' + (index + 1) + '/' + maxItems[itemType]);
		}
	}	

	/* updatePositions has to be kept separate from updateItems because when
	the form is submitted the new forms get moved to the end of the formset but
	their position has to NOT be updated. */
	updatePositions = function() {
		$(itemsClassList).each(function(index) {
			$(this).find('[name$="position"]').val(index);
		});
		$('.entry').each(function() {
			$(this).find('.episode').each(function(index) {
				$(this).find('[name$="ep-position"]').val(index);
			})
		})
	}

/* If timeline_edit gets reloaded because it's invalid, this  
keeps the items marked for deletion properly hidden. The second parameter is 
to set fadeoutTime to 0 so that the deleted items disappear immediately*/
	// $(document).ready(function() {
	// 	$(itemsClassList).each(function() {
	// 		if ($(this).find('[name$="DELETE"]').val() === 'true') {
	// 			var button = $(this).find('[class^="tlbutton-delete"]')
	// 			buttonHandler(button, 0)
	// 		}
	// 	});
	// });

/* Calls buttonHandler when a button is clicked. These functions are separate 
because buttonHandler also has to be called when the page first loads. */
	// $(document).on('click', 'a[class^="tlbutton"]', function() {
	// 	if (!$(this).hasClass('temp-disabled')) {
	// 		buttonHandler($(this));
	// 	}
	// })

/* Gets the required paramaters when delete/undelete/insert is clicked, then
sends those parameters to the appropriate function. Also flags that button as
temporarily disabled, to prevent glitches from accidental double clicks. */
	// function buttonHandler(button, fadeOutTime=500) {
	// 	var	action = button.attr('class').split('-')[1],
	// 		itemType = button.attr('class').split('-')[2],
	// 		itemNumber = button.attr('id').split('-')[1]
	// 	if (itemType === 'ep') {
	// 		epNumber = button.attr('id').split('-')[3];
	// 		idBase = 'id_entry-' + itemNumber + '-ep-' + epNumber + '-'
	// 		formCount = 0; //PLACEHOLDER
	// 	} else {
	// 		idBase = "id_" + itemType + '-' + itemNumber + '-';
	// 		formCount = parseInt(totalItems[itemType].val());
	// 	}
	// 	var parentForm = $('#' + idBase + 'div');
	// 	button.addClass('temp-disabled');
	// 	if (action === 'insert') {
	// 		insertItem(button, itemType, parentForm, formCount)
	// 	} else if (action === 'delete') {
	// 		deleteItem(button, itemType, idBase, parentForm, fadeOutTime)
	// 	} else if (action === 'undelete') {
	// 		undeleteItem(button, itemType, idBase, parentForm, formCount)
	// 	} else if (action === 'up' || action === 'down') {
	// 		moveItem(button, action, idBase, parentForm)
	// 	} else if (action === 'showlist' || action === 'hidelist') {
	// 		showHideEpList(button, idBase)
	// 	}
	// }

	function getButtonData(button) {
		buttonData = {
			action: button.attr('class').split('-')[0],
			itemType: button.attr('class').split('-')[1],
			itemNumber: button.attr('id').split('-')[1]
		}
		if (buttonData.itemType === 'ep') {
			buttonData.epNumber = button.attr('id').split('-')[3];
			buttonData.idBase = 'id_entry-' + buttonData.itemNumber + '-ep-' + 
				buttonData.epNumber + '-';
			buttonData.formCount = 0; //PLACEHOLDER
		} else {
			buttonData.idBase = "id_" + buttonData.itemType + '-' + 
				buttonData.itemNumber + '-';
			buttonData.formCount = parseInt(totalItems[buttonData.itemType].val());
		}
		buttonData.parentForm = $('#' + buttonData.idBase + 'div');
		return buttonData
	}

	$(document).on('click', 'a[class^="insert"]', function() {
		button = $(this)
		const {itemType, parentForm, formCount} = getButtonData(button)
		if (maxItems[itemType] <= formCount) {
			alert(maxItemsMessages[itemType]);
		} else {
			templateCopy = itemTemplates[itemType].clone(true);
			button.parent().parent().after(templateCopy);
			templateCopy.hide().fadeIn(1000);
			// totalItems[itemType].val(formCount + 1);
			finishItemChanges(button);
		};
	})

	$(document).on('click', 'a[class^="delete"]', function() {
		button = $(this)
		if (!button.hasClass('temp-disabled')) {
			deleteItem($(this), 500)
		}
	})

	$(document).ready(function() {
		$(itemsClassList).each(function() {
			if ($(this).find('[name$="DELETE"]').val() === 'true') {
				var button = $(this).find('[class^="delete"]')
				deleteItem(button, 0)
			}
		});
	});

	function deleteItem(button, fadeOutTime) {
		const {itemType, idBase, parentForm} = getButtonData(button)
		button.addClass('temp-disabled')

		deletedName = $('#' + idBase + fieldToGetNameFrom[itemType]).val();
		if (deletedName.length > 30) {
			deletedName = deletedVal.slice(0,25) + '...'
		}
		undeleteText = '<p><a class="undelete-' + itemType + '" id="' + 
			idBase + 'undelete" href="javascript:void(0)"> Undo Delete ' + 
			itemNamesUpper[itemType] + '</a> - "' + deletedName + '"</p>'

		$('#' + idBase + 'DELETE').val(true)
		$('.user-form').addClass('changed-input');
		parentForm.fadeOut(fadeOutTime, function() { 
			parentForm.after(undeleteText);
			finishItemChanges(button);
		});
	}

	$(document).on('click', 'a[class^="undelete"]', function() {
		button = $(this)
		if (!button.hasClass('temp-disabled')) {
			const {itemType, idBase, parentForm, formCount} = getButtonData(button)
			button.addClass('temp-disabled')
			if (maxItems[itemType] <= formCount) {
				alert(maxItemsMessages[itemType]);
			} else {
				$('#' + idBase + 'DELETE').val('')
				parentForm.fadeIn(1000);
				button.parent().remove();
				finishItemChanges(button);
			}
		}
	})

	$(document).on('click', 'a[class^="show"],a[class^="hide"]', function() {
		button = $(this);
		const {idBase} = getButtonData(button);
		$('#' + idBase + 'show-ep').toggle();
		$('#' + idBase + 'hide-ep').toggle();
		$('#' + idBase + 'ep-list').toggle();
	})

	$(document).on('click', 'a[class^="up"],a[class^="down"]', function() {
		button = $(this)
		if (!button.hasClass('temp-disabled')) {
			const {action, idBase, parentForm} = getButtonData(button)
			button.addClass('temp-disabled')
			if (action === 'up') {
				swapPartners = parentForm.prevAll().filter("div:visible");
			} else if (action === 'down'){
				swapPartners = parentForm.nextAll().filter("div:visible");
			}
			itemToSwapWith = swapPartners.first();
			if (itemToSwapWith.length && !itemToSwapWith.hasClass('unswappable')) {
				$('.user-form').addClass('changed-input');
				parentForm.swap(itemToSwapWith, button)
			} else {
				/* We have to remove temp-disabled here, because otherwise if the down 
				button of the lowest item or the up button of the highest item gets
				pressed, then it will get permanently disabled even if the item gets 
				moved up or down later */
				button.removeClass('temp-disabled');
			}
		}
	})


	// /* fadeOutTime is a parameter because this is also called when the page is 
	// loaded, and in that case it has to be 0 */
	// function deleteItem(button, itemType, idBase, parentForm, fadeOutTime=500) {
	// 	deletedName = $('#' + idBase + fieldToGetNameFrom[itemType]).val();
	// 	if (deletedName.length > 30) {
	// 		deletedName = deletedVal.slice(0,25) + '...'
	// 	}
	// 	undeleteText = '<p><a class="tlbutton-undelete-' + itemType + '" id="' + 
	// 		idBase + 'undelete" href="javascript:void(0)"> Undo Delete ' + 
	// 		itemNamesUpper[itemType] + '</a> - "' + deletedName + '"</p>'

	// 	$('#' + idBase + 'DELETE').val(true)
	// 	$('.user-form').addClass('changed-input');
	// 	parentForm.fadeOut(fadeOutTime, function() { 
	// 		parentForm.after(undeleteText);
	// 		finishItemChanges(button);
	// 	});
	// }
	
	// function undeleteItem(button, itemType, idBase, parentForm, formCount) {
	// 	if (maxItems[itemType] <= formCount) {
	// 		alert(maxItemsMessages[itemType]);
	// 	} else {
	// 		$('#' + idBase + 'DELETE').val('')
	// 		parentForm.fadeIn(1000);
	// 		button.parent().remove();
	// 		finishItemChanges(button);
	// 	}
	// };

	// function insertItem(button, itemType, parentForm, formCount) {
	// 	if (maxItems[itemType] <= formCount) {
	// 		alert(maxItemsMessages[itemType]);
	// 	} else {
	// 		templateCopy = itemTemplates[itemType].clone(true);
	// 		button.parent().parent().after(templateCopy);
	// 		templateCopy.hide().fadeIn(1000);
	// 		// totalItems[itemType].val(formCount + 1);
	// 		finishItemChanges(button);
	// 	};
	// }

	// function moveItem(button, action, idBase, parentForm) {
	// 	if (action === 'up') {
	// 		swapPartners = parentForm.prevAll().filter("div:visible");
	// 	} else if (action === 'down'){
	// 		swapPartners = parentForm.nextAll().filter("div:visible");
	// 	}
	// 	itemToSwapWith = swapPartners.first();
	// 	if (itemToSwapWith.length && !itemToSwapWith.hasClass('unswappable')) {
	// 		$('.user-form').addClass('changed-input');
	// 		parentForm.swap(itemToSwapWith, button)
	// 	} else {
	// 		/* We have to remove temp-disabled here, because otherwise if the down 
	// 		button of the lowest item or the up button of the highest item gets
	// 		pressed, then it will get permanently disabled even if the item gets 
	// 		moved up or down later */
	// 		button.removeClass('temp-disabled');
	// 	}
	// }

	// function showHideEpList(button, idBase) {
	// 	$('#' + idBase + 'show-ep').toggle();
	// 	$('#' + idBase + 'hide-ep').toggle();
	// 	$('#' + idBase + 'ep-list').toggle();
	// 	button.removeClass('temp-disabled');
	// }

	// Called by deleteItem, undeleteItem, insertItem to finish things up
	function finishItemChanges(button) {
		updateItems();
		updatePositions();
		button.removeClass('temp-disabled');
	}


/* Moves the newly inserted items to the end of the formset upon submission, 
since Django wants formsets to have the old ones with IDs first and the new 
ones without IDs at the end or it will cause an error. Bit of a hack to do it 
in JS, but probably the least bad solution. */
	$('form.timeline-edit-form').submit(function(e) {
		/* To keep the order right, you have to call updatePositions, then reorder 
		the items, then call updateItems */
		updatePositions();
		$(itemsClassList).each(function() {
			if ($(this).find('[name$="id"]').val() == '') {
				$(this).appendTo($('.formset'));
			}
		})
		updateItems();
	});
});

