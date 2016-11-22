import express from 'express';
import cors from 'cors';
import fetch from 'isomorphic-fetch';
import _ from 'lodash';


const app = express();
app.use(cors());

const pcUrl = 'https://gist.githubusercontent.com/isuvorov/ce6b8d87983611482aac89f6d7bc0037/raw/pc.json';

// let pc = await fetch(pcUrl);
// fetch(pcUrl)
//   .then(async (res) => {
//     pc = await res.json();
//   })
//   .catch(err => {
//     console.log('Чтото пошло не так:', err);
//   });
async function loadpc(url) {
  const response = await fetch(url);
  const result = await response.json();
  return result;
}


app.use( async function (req, res, next) {
  const ph = req.path;
  const query = _.split(ph, '/').slice(1);
  const page = await loadpc(pcUrl);
  res.status(200);
  if (ph === '/') {
    res.json(page);
  }
// res.send(query);
  let result = page;
  // query = query.slice(1);
  // _.forEach(query, async function (el) {
  //   result = await _.get(result, el);
  // });
  if (ph === '/volumes') {
    const sizes = await _.values(await _.get(page, 'hdd'));
    const C = await _.get(sizes[0], 'size') + await _.get(sizes[2], 'size');
    const D = await _.get(sizes[1], 'size');
    const volumes = {
      'C:': `${C}B`,
      'D:': `${D}B`,
    };
    res.json(volumes);
  }

  for (let index = 0; index < query.length; index++) {
    result = await _.get(result, query[index])
  }
  if (_.isNumber(result)) {
    res.send(result.toString());
  }
  if (_.isEmpty(result)) {
    res.status(404).send('Not Found');
  }
  res.json(result);
  next();
});

// app.get('/', async (req, res) => {
//   const page = loadpc(pcUrl);
// //  const brd = req.path;
//   res.send(req.path);
//   const pc = _.pick(page, ['board', 'ram']);
//   res.json(pc);
// });

app.listen(3000, () => {
  console.log('Your app listening on port 3000!');
});
