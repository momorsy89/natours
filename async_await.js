const superagent = require("superagent");
const fs = require("fs");
const { Promise } = require("mongoose");
const { map } = require("lodash");

const readFilePro = (file) => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, "utf8", (err, data) => {
      if (err) {
        console.log("cannt read file");
        reject("file is not found");
      }
      resolve(data);
    });
  });
};

const writeFilePro = (file, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, (e) => {
      if (e) reject("cannt write to file");
      resolve("file was written");
    });
  });
};

const dogPic = async () => {
  try {
    const data = await readFilePro("./abc.txt");
    const res1pro = superagent.get(
      `https://dog.ceo/api/breed/${data}/images/random`
    );
    const res2pro = superagent.get(
      `https://dog.ceo/api/breed/${data}/images/random`
    );
    const res3pro = superagent.get(
      `https://dog.ceo/api/breed/${data}/images/random`
    );
    const all=await Promise.all([res1pro,res2pro,res3pro]);
    const imgs=all.map(el=>el.body.message);
    await writeFilePro("./xyz.txt", imgs.join('\n'));
  } catch (e) {
    console.log(e.message);
    throw e;
  }

  return "here";
};
(async () => {
  try {
    const x = await dogPic();
    console.log(x);
  } catch (e) {
    console.log("error");
  }
})();

/*
readFilePro('./abc.txt').then(data=>{
    console.log(data);
    return superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
})
.then(res=>{
    return writeFilePro('./xyz.txt',res.body.message);
})
.then(()=>{
    console.log('file was witten')
})
.catch((e)=>{
    console.log(e.message)
});
*/
