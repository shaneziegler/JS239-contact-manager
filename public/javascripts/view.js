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

    this.tagsList = [];
    this.filterValue = "";
    this.searchString = "";
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
    newTag.innerHTML = `<a href="clear">CLEAR TAG FILTER</a>`;
    p.insertAdjacentElement("beforeend", newTag);

    this.searchInput.value = "";
    this.searchString = "";
  }

  // Bind event listeners
  bindAddContact(handler) {
    this.addContactButtons.addEventListener('click', event => {
      event.preventDefault()

      if (event.target.value === "Cancel") {
        this.addContactSection.classList.add("hide");
        this.searchSection.classList.remove("hide");
      } else if (event.target.value === "Submit") {
        this.#resetNewContactFormErrors();

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
    
        handler(contactInfo);

        this.addContactSection.classList.add("hide");
        this.searchSection.classList.remove("hide");
      }
    })
  }

  bindEditContact(handler) {
    //!!!!!!!!!!!
    this.form.addEventListener('submit', event => {
      event.preventDefault()
  
      if (this._todoText) {
        handler(this._todoText)
        this._resetInput()
      }
    })
  }
  
  bindDeleteContact(handler) {
    this.main.addEventListener('click', event => {
      event.preventDefault()

      if (event.target.value === "Delete") {

        let confirmDelete = confirm("Do you want to delete the contact?");
        if (confirmDelete) {
          let div = event.target.closest('div');
          let id = div.dataset.id;
          console.log(id);
          handler(id);
        }
      }
    })
  }

  #addSearchInputListener() {
    this.searchInput.addEventListener('keyup', event => {
      event.preventDefault()

      // Hide any contacts that don't match the search string
      this.searchString = this.searchInput.value.trim().toLowerCase();

      this.#showOnlySelectedContacts(this.searchString, this.filterValue);
    })
  }

  #showOnlySelectedContacts(searchString, filterTag) {
    let contactDivs = this.main.querySelectorAll('.contact');

    contactDivs.forEach(div => {
      div.classList.remove('hide');
    });

    contactDivs.forEach(div => {
      if (!div.querySelector('h1').textContent.toLowerCase().includes(searchString)) {
        div.classList.add('hide');
      }
      
      if (filterTag !== "") {
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
      let inputs = this.addContactSection.querySelectorAll("input[type=text]");
      inputs.forEach(input => {
        input.value = "";
      });

      let options = this.addContactSection.querySelectorAll('option');
      options.forEach(option => {
        option.selected = false;
      });
      options[0].selected = true;

      this.#resetNewContactFormErrors();

      this.searchSection.classList.add("hide");
      this.addContactSection.classList.remove("hide");
    })
  }

  #resetNewContactFormErrors() {
    let errors = this.addContactSection.querySelectorAll('.show-validator-error');
    errors.forEach(error => {
      error.classList.remove('show-validator-error');
      error.classList.add('hide-validator-error');
    })
  }

  #addTagFilterListener() {    // Listener for tag filtering
    this.tagFilter.addEventListener('click', event => {
      event.preventDefault();

      if (event.target.tagName === 'A') {
        this.filterValue = event.target.getAttribute('href');
        if (this.filterValue === "clear") this.filterValue = "";
        this.searchString = this.searchInput.value.trim().toLowerCase();
        this.#showOnlySelectedContacts(this.searchString, this.filterValue);
      }
    })
  }

  #addNewTagButtonListener() {    // Listener for add new tag button click
      document.querySelector('#new-tag-button').addEventListener('click', event => {
      event.preventDefault();
      let tagInput = document.querySelector('#new-tag-input');
      this.tagsList.push(tagInput.value);
      this.tagBox.innerHTML = this.tagSelectBoxTemplate({ tags : this.tagsList});
      tagInput.value = "";
    })
  }
}