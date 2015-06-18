import {Inject, getServices} from 'utils/di';

class ServerService {
  services: any;

  constructor(
    @Inject('$http') http, 
    @Inject('API_BASE_URL') API_BASE_URL
    ) {
    this.services = getServices(this.constructor, arguments);
  }

  get(path) {
    return this.services.$http.get(
      this.services.API_BASE_URL + path)
        .then(function(response) {
          return response.data;
        });
  }

  post(path, data) {
    return this.services.$http.post(
      this.services.API_BASE_URL + path, data);
  }

  put(path, id, data) {
    return this.services.$http.put(
      this.services.API_BASE_URL + path + '/' + id, data);
  }
}

export {ServerService};