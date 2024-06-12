"use strict";

import { View } from './view.js';
import { APIHandler } from './api_handlers.js';

document.addEventListener('DOMContentLoaded', () => {
  let apiHandler = new APIHandler();
  let view = new View();

  new Manager(apiHandler, view);
});

class Manager {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.bind();

    this.init();
  }

  async init() {  // Draw initial contacts on load
    this.model.contacts = await this.model.getAllContacts();
    this.onContactListChanged(this.model.contacts);
  }

  onContactListChanged = (contacts) => {
    this.view.displayContacts(contacts);
  }

  handleAddContact = (newContactInfo) => {
    this.model.addNewContact(newContactInfo);
  }
  
  handleEditContact = (id, contactInfo) => {
    this.model.editContact(id, contactInfo);
  }
  
  handleDeleteContact = (id) => {
    this.model.deleteContact(id);
  }

  bind() {
    this.view.bindAddContact(this.handleAddContact);
    this.view.bindDeleteContact(this.handleDeleteContact);
    this.model.bindContactListChanged(this.onContactListChanged)
  }
}