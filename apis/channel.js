import config from '../config';
require('es6-promise').polyfill();
import fetch from 'isomorphic-fetch';
import * as tinyHelper from '../libs/tinyHelper';

const apiUrl = config.serverless_url + 'channels';

export const getAllChannels = async function (sort, order) {
  const query = {
    sort: sort || '',
    order: order || '',
  };
  const queryString = tinyHelper.getQueryString(query);
  const result = await fetch(apiUrl + queryString, {
    method: 'GET',
  });
  const channels = await result.json();

  return channels;
};
