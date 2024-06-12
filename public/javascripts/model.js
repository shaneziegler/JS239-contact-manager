class Model {
  constructor() {
    // The state of the model, an array of todo objects, prepopulated with some data
    // this.todos = [
    //   {id: 1, text: 'Run a marathon', complete: false},
    //   {id: 2, text: 'Plant a garden', complete: false},
    // ]
    debugger;
    Model.fetchResource("http://localhost:3000/api/contacts");
  }

  static async fetchResource(uri) {
    try {
      const rawData = await fetch(uri).then(response => {  
        if (!response.ok) {
          const error = new Error(response.statusText);
          error.status = response.status;
          throw error;
        }

        return response.json();
      });

      console.log("Raw Data Fetch Response", rawData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  
  

  addNewContact() {
    // post method
    // http://localhost:3000/api/contacts/
    // Accepts JSON or query string as request body. Responds with JSON representation of the contact with given id. Returns 400 error if the contact cannot be found.

    /*
    Parameter
      Field	Type	Description
        full_name	String	
        Required: Full name of the contact

        email	String	
        Email of the contact.

        phone_number	String	
        Phone number of the contact.

        tags	String	
        Comma-separated list of tags associated with the contact.
    */



    /*   response
    HTTP/1.1 201 OK
      {
        "id": 1,
        "full_name": "Arthur Dent",
        "email": "dent@example.com",
        "phone_number": "12345678901",
        "tags": "work,business"
      } */

  }

  updateContact() {
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

  deleteContact(id) {
    // del method
    // http://localhost:3000/api/contacts/:id
    // HTTP/1.1 204 No Content    on success

  }
  getAllContacts() {
    // get method
    // http://localhost:3000/api/contacts

    /*
    HTTP/1.1 200 OK
    [
      {
        "id": 1,
        "full_name": "Arthur Dent",
        "email": "dent@example.com",
        "phone_number": "12345678901",
        "tags": "work,business"
      },
      {
        "id": 2,
        "full_name": "George Smiley",
        "email": "smiley@example.com",
        "phone_number": "12345678901",
        "tags": null
      }
    ] */
  }

  getContact() {
    // get method
    // http://localhost:3000/api/contacts/:id
    /*
    HTTP/1.1 200 OK
    {
      "id": 1,
      "full_name": "Arthur Dent",
      "email": "dent@example.com",
      "phone_number": "12345678901",
      "tags": "work,business"
    } */
  }

}

export { Model };