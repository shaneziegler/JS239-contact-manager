"use strict";

import { validateEmail, validatePhoneNumber, validateName } from "./helpers.js";

export class View {
  constructor() {
    // Grab some initial HTML elements
    this.main = document.querySelector('main');
    this.searchSection = document.querySelector('#search');
    this.searchInput = document.querySelector('#search-input');
    this.addContactSection = document.querySelector('#add-contact');
    this.addContactButtons = document.querySelector('#add-contact-buttons');
    this.tagBox = document.querySelector('#tag-box');
    this.tagFilter = document.querySelector('#tag-filter');

    // Setup Handlebars Templates
    this.displayContactsTemplate = Handlebars.compile(document.getElementById('display-contacts').innerHTML);
    this.tagSelectBoxTemplate = Handlebars.compile(document.getElementById('tagSelectBoxTemplate').innerHTML);

    let tagHTML = document.getElementById('tagTemplate').innerHTML;
    Handlebars.registerPartial('tagTemplate', tagHTML);

    // Setup some view specific listeners
    this.#addSearchInputListener();
    this.#addAddContactListener();
    this.#addTagFilterListener();
    this.#addNewTagButtonListener();
    this.#addEditContactListener()

    this.tagsList = [];
    this.filterValue = "";
    this.searchString = "";
    this.contacts = [];
  }
    
  displayContacts(contacts) {
    // Convert tags comma delimited string into an array of individual tags for anchor links
    // And populate this.tagList with all current tags in use
    this.tagsList = [];

    contacts.forEach(contact => {
      if (!contact.tags || contact.tags.trim() === "") {
        contact.tags = null;
      } else {
        let tagsArray = contact.tags.split(",").map(tag => tag.trim());
        contact.tags = tagsArray;
        this.tagsList.push(contact.tags.slice());
      }
    })

    this.tagsList = [...new Set(this.tagsList.flat())];

    this.main.innerHTML = this.displayContactsTemplate({ contacts : contacts });
    this.tagBox.innerHTML = this.tagSelectBoxTemplate({ tags : this.tagsList});

    this.#addContactTagListener();

    this.#createTagFilterLinks();

    this.searchInput.value = "";
    this.searchString = "";
    this.contacts = contacts.slice();
  }


  #createTagFilterLinks() {
    // Display possible tag filters
    let p = this.tagFilter.querySelector('p');
    p.innerHTML = "Filter by tag: ";
    let tagNode = document.createElement('span');
    tagNode.classList.add('filter-tag');
    this.tagsList.forEach(tag => {
      let newTag = tagNode.cloneNode(true);
      newTag.innerHTML = `<a href="${tag}">${tag}</a>`;
      p.insertAdjacentElement("beforeend", newTag);
    });

    let newTag = tagNode.cloneNode(true);
    newTag.innerHTML = `<a href="CLEAR_TAGS">CLEAR TAG FILTER</a>`;
    p.insertAdjacentElement("beforeend", newTag);
  }


  // Bind event listeners
  bindAddOrEditContact(addContactHandler, editContactHandler) {
    this.addContactButtons.addEventListener('click', event => {
      event.preventDefault()

      if (event.target.value === "Cancel") {
        this.addContactSection.classList.add("hide");
        this.searchSection.classList.remove("hide");
      } else if (event.target.value === "Submit") {
        this.#resetNewContactFormErrors();

        let id = this.addContactSection.querySelector('#contact-id').innerHTML
        let name = this.addContactSection.querySelector('#full-name').value;
        let email = this.addContactSection.querySelector('#email').value;
        let phoneNumber = this.addContactSection.querySelector('#phone-number').value;

        let options = this.addContactSection.querySelectorAll('option');
        let tagsArray = [];
        options.forEach(option => {
          if (option.selected) tagsArray.push(option.value);
        });

        if (!validateName(name)) {
          this.addContactSection.querySelector('#bad-name').classList.add('show-validator-error');
          this.addContactSection.querySelector('#bad-name').classList.remove('hide-validator-error');
          return;
        }

        if (!validateEmail(email)) {
          this.addContactSection.querySelector('#bad-email').classList.add('show-validator-error');
          this.addContactSection.querySelector('#bad-email').classList.remove('hide-validator-error');
          return;
        }

        if (!validatePhoneNumber(phoneNumber)) {
          this.addContactSection.querySelector('#bad-phone-number').classList.add('show-validator-error');
          this.addContactSection.querySelector('#bad-phone-number').classList.remove('hide-validator-error');
          return;
        }

        let contactInfo = {
          full_name: name,
          email: email,
          phone_number: phoneNumber,
          tags: tagsArray.join(",")
        };
      
        let mode = this.addContactSection.querySelector('#create-contact-form-mode').textContent;

        if (mode === "ADD") {
          addContactHandler(contactInfo);
        } else if (mode === "EDIT") {
          contactInfo.id = id;
          editContactHandler(contactInfo);
        } else {
          console.log('Something is wrong, not in ADD or EDIT mode!')
          throw new error('Something is wrong, not in ADD or EDIT mode!');
        }

        this.addContactSection.classList.add("hide");
        this.searchSection.classList.remove("hide");
      }
    });
  }

  bindDeleteContact(handler) {
    this.main.addEventListener('click', event => {
      event.preventDefault()

      if (event.target.value === "Delete") {

        let confirmDelete = confirm("Do you want to delete the contact?");
        if (confirmDelete) {
          let div = event.target.closest('div');
          let id = div.dataset.id;
          handler(id);
        }
      }
    });
  }

  #addSearchInputListener() {
    this.searchInput.addEventListener('keyup', event => {
      event.preventDefault()

      // Hide any contacts that don't match the search string
      this.searchString = this.searchInput.value.trim().toLowerCase();

      this.#showOnlySelectedContacts(this.searchString, this.filterValue);
    });
  }

  #showOnlySelectedContacts(searchString, filterTag) {
    let contactDivs = this.main.querySelectorAll('.contact');

    contactDivs.forEach(div => {  // Unhide all contacts
      div.classList.remove('hide');
    });

    contactDivs.forEach(div => {  // Hide contacts not matching search string
      if (!div.querySelector('h1').textContent.toLowerCase().includes(searchString)) {
        div.classList.add('hide');
      }
      
      if (filterTag !== "") {  // Hide contacts not matching tag filter
        let tags = div.querySelectorAll('a');
        let tagsList = [];
        tags.forEach(tag => {
          tagsList.push(tag.textContent);
        });
        if (!tagsList.includes(filterTag)) {
          div.classList.add('hide');
        }
      }
    });
  }

  #addAddContactListener() {    // For the Add Contact button on initial main page that opens up the form for new contact info
    this.searchSection.addEventListener('submit', event => {
      event.preventDefault();

      // Reset inputs and clear tags selections
      this.addContactSection.querySelector('h1').textContent = "Create Contact";
      this.addContactSection.querySelector('#create-contact-form-mode').textContent = "ADD";
      this.#resetContactFormInputsAndTags();

      this.#resetNewContactFormErrors();

      this.searchSection.classList.add("hide");
      this.addContactSection.classList.remove("hide");
    })
  }

  #addEditContactListener() {    // For the Edit button on contacts
    this.main.addEventListener('click', event => {
      event.preventDefault()

      if (event.target.value === "Edit") {
        let div = event.target.closest('div');
        let id = div.dataset.id;

        // Re-use the add contact form, but change and fill for editing
        // Reset inputs and clear tags selections
        this.addContactSection.querySelector('h1').textContent = "Edit Contact";
        this.addContactSection.querySelector('#create-contact-form-mode').textContent = "EDIT";

        this.#resetContactFormInputsAndTags();

        this.#resetNewContactFormErrors();

        // Populate "add contact" form for editing with contact info
        let contact = this.contacts.filter(contactObj => Number(contactObj.id) === Number(id))[0];
        this.addContactSection.querySelector('#contact-id').innerHTML = contact.id;
        this.addContactSection.querySelector('#full-name').value = contact.full_name;
        this.addContactSection.querySelector('#email').value = contact.email;
        this.addContactSection.querySelector('#phone-number').value = contact.phone_number;

        if (Array.isArray(contact.tags)) {
          let options = this.addContactSection.querySelectorAll('option');
          options.forEach(option => {
            if (contact.tags.includes(option.value)) {
              option.selected = true;
            }
          });
          options[0].selected = false;
        }

        this.searchSection.classList.add("hide");
        this.addContactSection.classList.remove("hide");
        window.scrollTo(0, 0);
      }
    });
  }

  #resetContactFormInputsAndTags() {
    let inputs = this.addContactSection.querySelectorAll("input[type=text]");
    inputs.forEach(input => {
      input.value = "";
    });

    let options = this.addContactSection.querySelectorAll('option');
    options.forEach(option => {
      option.selected = false;
    });
    options[0].selected = true;
  }

  #resetNewContactFormErrors() {
    let errors = this.addContactSection.querySelectorAll('.show-validator-error');
    errors.forEach(error => {
      error.classList.remove('show-validator-error');
      error.classList.add('hide-validator-error');
    })
  }

  #addTagFilterListener() {    // Listener for tag filtering near search bar
    this.tagFilter.addEventListener('click', event => {
      event.preventDefault();

      if (event.target.tagName === 'A') {
        this.filterValue = event.target.getAttribute('href');
        if (this.filterValue === "CLEAR_TAGS") this.filterValue = "";
        this.searchString = this.searchInput.value.trim().toLowerCase();
        this.#showOnlySelectedContacts(this.searchString, this.filterValue);
      }
    })
  }

  #addContactTagListener() {    // Listener for tag filtering on individual contacts
    this.main.addEventListener('click', event => {
      event.preventDefault();

      if (event.target.tagName === 'A') {
        this.filterValue = event.target.dataset.tag;

        this.searchString = this.searchInput.value.trim().toLowerCase();
        this.#showOnlySelectedContacts(this.searchString, this.filterValue);
      }
    })
  }

  #addNewTagButtonListener() {    // Listener for add new tag button click on new contact form
      document.querySelector('#new-tag-button').addEventListener('click', event => {
      event.preventDefault();
      let tagInput = document.querySelector('#new-tag-input');
      this.tagsList.push(tagInput.value);
      this.tagBox.innerHTML = this.tagSelectBoxTemplate({ tags : this.tagsList});
      tagInput.value = "";
    })
  }
}