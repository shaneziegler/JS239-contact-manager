"use strict";

export class APIHandler {
  constructor() {
    this.contacts = [];
  }

  // async buildContacts() {
  //   let contactsArray = this.getAllContacts();
  //   return contactsArray;
  // }

  bindContactListChanged(callback) {
    this.onContactListChanged = callback
  }

  static async fetchResource(uri, method, dataObj) {
    let fetchOptions;

    if (method === 'DELETE') {
      fetchOptions = { method: 'DELETE' };
    } else {
      fetchOptions = {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataObj),
      }
    }

    try {
      const data = await fetch(uri, fetchOptions).then(response => {
        if (!response.ok) {
          const error = new Error(response.statusText);
          error.status = response.status;
          throw error;
        }
        if (method === 'DELETE') {
          return response.status;
        } else {
          return response.json();
        }
      });

      return data;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  
  async addNewContact(contactInfo) {
    let result = await APIHandler.fetchResource('http://localhost:3000/api/contacts/', 'POST', contactInfo)
    console.log(`New ID added: ${result.id}`);
    this.contacts = await this.getAllContacts();
    this.onContactListChanged(this.contacts)
  }

  async updateContact() {
    // put method
    // http://localhost:3000/api/contacts/:id
    // Accepts JSON or query string as request body. Preserves previous values of attributes that aren't present.

        /*
    Parameter
      Field	Type	Description
        id	Integer	
        Unique ID of the contact

        full_name	String	
        Required: Full name of the contact

        email	String	
        Email of the contact.

        phone_number	String	
        Phone number of the contact.

        tags	String	
        Comma-separated list of tags associated with the contact.
    */

  }


  async deleteContact(id) {
    let result = await APIHandler.fetchResource(`http://localhost:3000/api/contacts/${id}`, 'DELETE', {})
    this.contacts = await this.getAllContacts();
    this.onContactListChanged(this.contacts)
  }


  async getAllContacts() {
    let contactsList = await APIHandler.fetchResource("http://localhost:3000/api/contacts");
    return contactsList;
  }

  async getContact(id) {
    return await APIHandler.fetchResource(`http://localhost:3000/api/contacts/${id}`);
  }
}