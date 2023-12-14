function sum(a,b) {
    return a+b;
  }
  
  async function throwError(){
    throw new Error("test");
  }
  
  module.exports = {
    sum,
    throwError
  }
  