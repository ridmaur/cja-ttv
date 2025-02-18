$(document).ready(function () {
    let checklistItems = [];
    let currentDropdownSelection = '';

    // Fetch and parse YAML data
    $.ajax({
        url: "checklist.yml",
        dataType: "text",
        success: function (data) {
            const parsedYaml = jsyaml.load(data);
            checklistItems = parsedYaml.checklistItems;
            // Add default checklist
            addChecklistItem("architect_schema");
            addChecklistItem("create_schema");
            addChecklistItem("create_dataset");
            addChecklistItem("create_datastream");
            addChecklistItem("add_aep_to_datastream");
            addChecklistItem("waiting_on_imp_select");
            addChecklistItem("create_connection");
            addChecklistItem("create_data_view");
            addChecklistItem("enable_adc");
            addChecklistItem("disable_adc");
            addChecklistItem("validate_cja_data");
            addChecklistItem("component_migration");
            addChecklistItem("remove_appm");

        },
        error: function (error) {
            console.error("Error loading the YAML file:", error);
        }
    });



    // Function to get the selected radio button value
    function getSelectedRadioValue(groupName) {
        return $(`input[name=${groupName}]:checked`).attr('id');
    }

    // Add a checklist item by ID
    function addChecklistItem(id) {
        const checklistContainer = document.getElementById('checklist-container');
        const itemData = checklistItems[id];  // Fetch the data for this checklist item

        if (!itemData) {
            console.error(`Checklist item with ID "${id}" not found.`);
            return;
        }

        // Create a new div for the checklist item
        const checklistItem = document.createElement('div');
        checklistItem.title = itemData.description || '';  // Add description as a tooltip for the whole box
        checklistItem.setAttribute('data-id', id);  // Set the ID for sorting purposes

        // Create a numeric identifier span (we'll update this in the sort function)
        const numberSpan = document.createElement('span');
        numberSpan.classList.add('checklist-number');
        numberSpan.textContent = '1. ';  // Placeholder; will be updated in sortChecklist
        numberSpan.style.marginRight = '10px';  // Adds space between the number and the label text

        // Create the checkbox input
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = id;
        checkbox.onchange = () => {
            if (checkbox.checked) {
                checklistItem.classList.add('checklist-item-checked');
            } else {
                checklistItem.classList.remove('checklist-item-checked');
            }
        };

        // Create the label (text as a link if the link property exists)
        const label = document.createElement('label');
        label.setAttribute('for', id);

        // Check if the item has a link
        if (itemData.link) {
            const anchor = document.createElement('a');
            anchor.href = itemData.link;
            anchor.textContent = itemData.text;
            anchor.target = '_blank';  // Opens link in a new tab
            label.appendChild(anchor);
        } else {
            label.textContent = itemData.text;  // Just use plain text if no link exists
        }

        // Append checkbox, number, and label to the div
        checklistItem.appendChild(checkbox);
        checklistItem.appendChild(numberSpan);
        checklistItem.appendChild(label);

        // Add the checklist item to the container
        checklistContainer.appendChild(checklistItem);

        // Sort the checklist after adding the new item
        sortChecklist();
    }



    // Function to remove checklist item by ID
    function removeChecklistItem(id) {
        $('#checklist-item-' + id).remove();
        sortChecklist();
    }

    // Sort the checklist by the order listed in the YAML file
    // Function to sort the checklist based on the order in checklistItems variable
    function sortChecklist() {
        const checklistContainer = document.getElementById('checklist-container');

        // Get all the checklist items (divs) in an array
        const itemsArray = Array.from(checklistContainer.children);

        // Sort the checklist items based on the order in checklistItems variable
        itemsArray.sort((a, b) => {
            const idA = a.getAttribute('data-id');
            const idB = b.getAttribute('data-id');

            const orderA = Object.keys(checklistItems).indexOf(idA);
            const orderB = Object.keys(checklistItems).indexOf(idB);

            return orderA - orderB;
        });

        // Clear the container and append the sorted items
        checklistContainer.innerHTML = '';
        itemsArray.forEach((item, index) => {
            // Update the numeric identifier (index starts from 0, so add 1)
            const numberSpan = item.querySelector('.checklist-number');
            numberSpan.textContent = (index + 1) + '. ';

            checklistContainer.appendChild(item);
        });
    }



    // Listen for dropdown changes
    $('#implementation-state').change(function () {
        currentDropdownSelection = $(this).val();  // Store the dropdown selection

        const checkboxChecked = $('#want-turn-off-aa').is(':checked');
        if (currentDropdownSelection === 'imp-type-have-manual' && checkboxChecked) {
            addChecklistItem("some_checklist_item");
        } else {
            removeChecklistItem("some_checklist_item");
        }
    });

    // Listen for checkbox changes
    $('#want-turn-off-aa').change(function () {
        const isChecked = $(this).is(':checked');

        if (isChecked && currentDropdownSelection === 'imp-type-have-manual') {
            addChecklistItem("some_checklist_item");
        } else {
            removeChecklistItem("some_checklist_item");
        }
    });

    // Listen for changes on any form element in the left column
    $('.accordion-content input').change(function () {
        const elementId = $(this).attr('id');
        const isChecked = $(this).is(':checked');

        switch (elementId) {
            case 'imp-appmeasurement':
                addChecklistItem("remove_appm");
                addChecklistItem("validate_cja_data");
                removeChecklistItem("remove_tags");
                removeChecklistItem("remove_api");
                break;
            case 'imp-web-sdk':
                addChecklistItem("remove_tags");
                addChecklistItem("validate_cja_data");
                removeChecklistItem("remove_appm");
                removeChecklistItem("remove_api");
                break;
            case 'want-turn-off-aa':
                const currentRadioValue = getSelectedRadioValue('implementation-have');
                if (isChecked && currentRadioValue === 'imp-appmeasurement') {
                    addChecklistItem("turn_off_aa_manual");
                    console.log("Manual triggered");
                } else {
                    removeChecklistItem("turn_off_aa_manual");
                }
                break;
            // Other cases...
            default:
                console.warn("Form element ID does not have an action:", elementId);
                break;
        }
    });

    // Function to show the popover on hover
    function showPopover(event, description) {
        // Remove any existing popover to avoid duplication
        let existingPopover = document.querySelector('.popover');
        if (existingPopover) {
            existingPopover.remove();
        }

        // Create a new popover element
        const popover = document.createElement('div');
        popover.classList.add('popover');
        popover.textContent = description;

        // Position the popover relative to the hovered element
        const rect = event.target.getBoundingClientRect();
        popover.style.left = `${rect.right + 10}px`;  // Offset 10px to the right
        popover.style.top = `${rect.top}px`;

        // Append the popover to the body
        document.body.appendChild(popover);
    }

    // Function to hide the popover on mouseout or click away
    function hidePopover() {
        let existingPopover = document.querySelector('.popover');
        if (existingPopover) {
            existingPopover.remove();
        }
    }

    // Add hover event listeners to elements that should trigger popovers
    document.querySelectorAll('.popover-icon').forEach(icon => {
        const description = icon.dataset.description; // Get the description from the data attribute
        icon.addEventListener('mouseover', (event) => showPopover(event, description));
        icon.addEventListener('mouseout', hidePopover);
    });

    // Toggle the display of the accordion content
    document.querySelectorAll('.accordion-header').forEach(header => {
        const content = header.nextElementSibling;

        // Open by default
        content.style.maxHeight = content.scrollHeight + "px";
        header.classList.add('active');

        header.addEventListener('click', function () {
            // If already open, collapse it
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
                header.classList.remove('active');
            }
            // If closed, expand it
            else {
                content.style.maxHeight = content.scrollHeight + "px";
                header.classList.add('active');
            }
        });
    });

    const questionnaire = {
        implementationState: {
            id: 'implementation-state',
            options: [
                'AppMeasurement or Analytics tag extension',
                'Web SDK',
                'Server-side API',
                'Legacy mobile implementation',
                'Mobile SDK',
                'No Adobe Analytics implementation'
            ],
            selected: null // to store the selected value
        },
        implementationType: {
            manual: {
                id: 'imp-type-have-manual',
                selected: false // to track if selected
            },
            tags: {
                id: 'imp-type-have-tags',
                selected: false
            },
            api: {
                id: 'imp-type-have-api',
                selected: false
            }
        },
        existingFeatures: {
            features: {
                turnOffAA: { id: 'want-turn-off-aa', selected: false },
                historicalData: { id: 'want-historical data', selected: false },
                componentMigration: { id: 'want-component-migration', selected: false },
                activityMapOverlay: { id: 'want-activity-map-overlay', selected: false },
                classifications: { id: 'want-classifications', selected: false },
                marketingChannels: { id: 'want-marketing-channels', selected: false },
                dataFeeds: { id: 'want-data-feeds', selected: false },
                streamingMedia: { id: 'want-streaming-media', selected: false }
            },
            customSchema: {
                id: 'want-custom-schema',
                selected: false
            },
            analyticsSchema: {
                id: 'want-analytics-schema',
                selected: false
            },
            implementationWant: {
                tags: { id: 'imp-type-want-tags', selected: false },
                manual: { id: 'imp-type-want-manual', selected: false },
                api: { id: 'imp-type-want-api', selected: false }
            }
        },
        newCJAfeatures: {
            omnichannel: { id: 'want-omnichannel', selected: false },
            rtcdp: { id: 'want-rtcdp', selected: false },
            ajo: { id: 'want-ajo', selected: false }
        },
        shortcuts: {
            keepAppMeasurement: { id: 'shortcut-keep-appmeasurement', selected: false },
            useDataLayer: { id: 'shortcut-use-data-layer', selected: false },
            a4t: { id: 'want-a4t', selected: false },
            aam: { id: 'want-aam', selected: false }
        },
        // Method to update selected values based on form inputs
        updateSelection: function (inputId, isSelected) {
            for (const section in this) {
                if (this[section].hasOwnProperty('features')) {
                    for (const feature in this[section].features) {
                        if (this[section].features[feature].id === inputId) {
                            this[section].features[feature].selected = isSelected;
                            return;
                        }
                    }
                } else if (this[section].hasOwnProperty('id') && this[section].id === inputId) {
                    this[section].selected = isSelected;
                }
            }
        },
        // Method to get selected values
        getSelectedValues: function () {
            const selectedValues = {};
            for (const section in this) {
                if (this[section].hasOwnProperty('features')) {
                    selectedValues[section] = Object.keys(this[section].features).filter(
                        feature => this[section].features[feature].selected
                    );
                } else if (this[section].hasOwnProperty('id')) {
                    selectedValues[section] = this[section].selected;
                }
            }
            return selectedValues;
        }
    };

    // Example of how to use the updateSelection method
    // You can call this method based on form input changes
    // For example, when an implementation type radio button is selected
    $('input[type="radio"]').change(function () {
        const inputId = $(this).attr('id');
        const isSelected = $(this).is(':checked');
        questionnaire.updateSelection(inputId, isSelected);
    });

    // Example to get selected values when needed
    const selectedValues = questionnaire.getSelectedValues();
    console.log(selectedValues);

});