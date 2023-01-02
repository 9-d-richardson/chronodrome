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

	itemNamesUpper['episode'] = "Episode"
	totalItems['episode'] = $('#id_episode-TOTAL_FORMS')
	maxItems['episode'] = $('[name="max-eps-per-entry"]').val()
	itemTemplates['episode'] = $('.episode:last').clone(true)
	maxItemsMessages['episode'] = 'Each entry can have a maximum of ' + 
		maxItems['episode'] + ' episodes.'
	fieldToGetNameFrom['episode'] = 'name'	

	itemTemplates['importepisodes'] = $('.importepisodes-div:last').clone(true)
	totalItems['importepisodes'] = $('#id_importepisodes-TOTAL_FORMS')

/*Removes images that have been prepared for upload. Will have to rewrite this
a bit if we make the form more complicated with extra divs. */
	$(document).on('click', 'button.remove-image', function(e) {
		e.preventDefault();
		$(this).siblings('input[type="file"]').val(null);
	});
			
	/* Updates the attributes and header of each timeline item to match its new 
	position */
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
		/* Does the same thing as above but for each entry's episodes. The header
		numbering is by entry, but the numbering for the HTML attributes numbers
		eps like they were any other TL item, because there would be naming 
		conflicts if each entry's eps started being numbered at 0. */
		$('.episode').each(function(index) {
			updateAttributes($(this), index, 'episode')
		})
		$('.entry').each(function() {
			$(this).find('.episode-header-text:visible').each(function(index) {
				updateHeader($(this), index, 'episode')
			})
		})
		/* Does the same thing but for the importepisodes feature. Note that the
		position value doesn't need to be handled specially. */
		$('.importepisodes-form-div').each(function(index) {
			updateAttributes($(this), index, 'importepisodes')
		})

		// Handles the Regex for updating each item's attributes
		function updateAttributes(item, index, itemType) {
			var idRegex = new RegExp(itemType + '-(\\d+|__prefix__)-'),
				replacement = itemType + '-' + index + '-';
			const attributes = ['for', 'id', 'name']
			item.find('*').addBack().each(function() {
				for (attribute of attributes) {
					if ($(this).attr(attribute)) {
						$(this).attr(attribute, $(this).attr(attribute).replace(idRegex, replacement));
					}
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
				$(this).find('[name$="position_episode"]').val(index);
			})
		})
	}

	/*A helper function for when TL buttons are clicked. Gathers all the 
	relevant data from the button as well as any other info the functions need*/
	function getButtonData(button) {
		buttonData = {
			action: button.attr('class').split('-')[0],
			itemType: button.attr('class').split('-')[1],
			itemNumber: button.attr('id').split('-')[1]
		}
		buttonData.idBase = "id_" + buttonData.itemType + '-' + 
			buttonData.itemNumber + '-';
		buttonData.formCount = parseInt(totalItems[buttonData.itemType].val());
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
			totalItems[itemType].val(formCount + 1);
			finishItemChanges(button);
		};
	})

/*For when the user deletes a TL item. Just calls the deleteItem function*/
	$(document).on('click', 'a[class^="delete"]', function() {
		button = $(this)
		if (!button.hasClass('temp-disabled')) {
			deleteItem($(this), 500)
		}
	})

/* If timeline_edit gets reloaded because it's invalid, this  keeps the items 
marked for deletion properly hidden. The second parameter is 
to set fadeoutTime to 0 so that the deleted items disappear immediately*/
	$(document).ready(function() {
		$(itemsClassList).each(function() {
			if ($(this).find('[name$="DELETE"]').val() === 'true') {
				var button = $(this).find('[class^="delete"]')
				deleteItem(button, 0)
			}
		});
	});

/*Hides items marked for deletion. Has to be a separate, named function
because it also gets called when the page first loads*/
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

		parentForm.find('[id$="DELETE"]').val(true)
		if (itemType === 'episode') {
			parentForm.find('[id$="DELETE"]').addClass('marked-for-deletion')
		}
		$('.user-form').addClass('changed-input');
		parentForm.fadeOut(fadeOutTime, function() { 
			parentForm.after(undeleteText);
			finishItemChanges(button);
		});
	}

	/* Unhides the item which had been marked for deletion and removes the
	undelete text */
	$(document).on('click', 'a[class^="undelete"]', function() {
		button = $(this)
		if (!button.hasClass('temp-disabled')) {
			const {itemType, idBase, parentForm, formCount} = getButtonData(button)
			if (maxItems[itemType] <= formCount) {
				alert(maxItemsMessages[itemType]);
			} else {
				button.addClass('temp-disabled')
				/* This bit of logic ensures that episodes which have been separately
				marked for deletion stay that way even when the parent entry is
				undeleted. */
				if (itemType === 'episode') {
					parentForm.removeClass('marked-for-deletion');
					parentForm.find('[id$="DELETE"]').val('')
				} else {
					parentForm.find('[id$="DELETE"][class!="marked-for-deletion"]').val('')
				}
				parentForm.fadeIn(500);
				button.parent().remove();
				finishItemChanges(button);
			}
		}
	})

	// Shows or hides the episode list for a given entry
	$(document).on('click', 'a[class^="show"],a[class^="hide"]', function() {
		button = $(this);
		const {idBase} = getButtonData(button);
		$('#' + idBase + 'show-episodes').toggle();
		$('#' + idBase + 'hide-episodes').toggle();
		$('#' + idBase + 'episode-list').toggle();
	})

	$(document).on('click', 'a[class^="addlist"]', function() {
		button = $(this);
		const {idBase} = getButtonData(button);
		$('#' + idBase + 'episode-list').show();
		$('#' + idBase + 'show-episodes').hide();
		$('#' + idBase + 'hide-episodes').show();
		$('#' + idBase + 'showhide-ep-buttons').show();
		$('#' + idBase + 'add-eplist-buttons').hide();
	})

	$(document).on('click', 'a[class^="addimport"]', function() {
		button = $(this);
		const {idBase} = getButtonData(button);
		console.log(idBase)
		templateCopy = itemTemplates['importepisodes'].clone(true);
		$('#' + idBase + 'import_form_div').append(templateCopy);
		templateCopy.show();
		$('#' + idBase + 'import_container_div').show();
		$('#' + idBase + 'showhide-ep-buttons').hide();
		$('#' + idBase + 'add-eplist-buttons').hide();
		formCount = parseInt(totalItems['importepisodes'].val());
		totalItems['importepisodes'].val(formCount + 1);
		updateItems();
		updatePositions();
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
		// e.preventDefault();
		// $('.episode-list').hide()
		/* To keep the order right, you have to call updatePositions, then reorder 
		the items, then call updateItems */
		updatePositions();
		for (itemType of itemTypes) {
			$('.' + itemType).each(function() {
				if ($(this).find('[name^="' + itemType + '"][name$="id"]').val() == '') {
					$(this).appendTo($('.formset'));
				}
			})
		}
		$('.episode').each(function() {
			if ($(this).find('[name$="id"]').val() == '') {
				$(this).appendTo($('.episode-list').eq(-2));
			}
		})
		updateItems();
	});
});

