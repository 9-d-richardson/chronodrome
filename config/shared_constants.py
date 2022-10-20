MaxNumEntries = 1000
MaxNumDividers = 50
MaxNumImages = 25

#How many rows to display for textareas by default
TextAreaRows = 10

CharFieldMaxLength = 500
TextFieldMaxLength = 10000
ImportFieldMaxLines = 1000
'''Technically this number isn't quite big enough to let the user input a full
500 characters for all 1000 entries, because it also counts the line breaks 
as characters, but whatever'''
ImportFieldMaxLength = CharFieldMaxLength * ImportFieldMaxLines

max_length_error = "Too many characters: %(show_value)d/%(limit_value)d."

# Default number for new TL items - makes sure they're at the end
extra_form_position = 9999