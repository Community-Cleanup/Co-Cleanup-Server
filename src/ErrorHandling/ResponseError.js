// These custom error classes are used to help ensure consistency in error responses,
// namely error messages, in any middleware error responses, depending on the HTTP status code

// Base/parent error response class
// Our ResponseErrorFactory class below should hopefully never need to instantiate this base class directly
class ResponseError {
  constructor(status) {
    this._message = "Unknown or Unhandled Error Occured";
    this._status = status || 500;
  }

  // Simply capitalises the first letter of every word in a string
  _capitalizeStringWords(message) {
    return message
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  // Read-only return the error message from the instance object
  get message() {
    return this._capitalizeStringWords(this._message);
  }
}

// For all 4xx errors that our app uses
class ClientError extends ResponseError {
  constructor(status) {
    super(status);

    switch (status) {
      case 400:
        this._message = "Bad Request";
        break;
      case 401:
        this._message = "Unauthorized";
        break;
      case 403:
        this._message = "Forbbiden";
        break;
      case 404:
        this._message = "Not Found";
        break;
    }
  }
}

// For all 5xx errors that our app uses
class ServerError extends ResponseError {
  constructor(status) {
    super(status);

    switch (status) {
      case 500:
        this._message = "Internal Server Error";
        break;
      case 503:
        this._message = "Service Unavailable";
        break;
    }
  }
}

// Using OOP factory design pattern, return a new response error handler object depending on
// the status code range that the status code falls into.
// This ensures good Dependency Injection.
// Return an instance of our base error class by default.
class ResponseErrorFactory {
  create(status) {
    if (status >= 500 && status <= 599) {
      return new ServerError(status);
    } else if (status >= 400 && status <= 499) {
      return new ClientError(status);
    } else {
      return new ResponseError();
    }
  }
}

module.exports = ResponseErrorFactory;
