// Base/parent error response class
class ResponseError {
  constructor(status) {
    // if (new.target === ResponseError) {
    //   throw new TypeError(
    //     "Cannot construct instances of base/abstract class directly"
    //   );
    // }
    this._message = "Unknown or Unhandled Error Occured";
    this._status = status || 500;
  }

  _capitalizeStringWords(message) {
    return message
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  get message() {
    return this._capitalizeStringWords(this._message);
  }

  //   set message(newMessage) {
  //     if (newMessage) {
  //       this._message = newMessage;
  //     }
  //   }

  //   get status() {
  //     return this._status;
  //   }

  //   set status(newStatus) {
  //     if (newStatus) {
  //       this._status = newStatus;
  //     }
  //   }
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
    }
  }
}

// Using OOP factory design pattern, return a new response error handler object depending on
// the status code range that the status code falls into
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
