const domain = {
  sub: window.location.host.split('.')[0],

  init: () => {
    if (domain.sub.indexOf('kantoor') >= 0) {
      const h1 = document.getElementsByTagName('h1')[0]
      var h1Content = h1.innerHTML
      console.log();
      h1.innerHTML = h1Content.replace(' daily ', '<s> daily</s> vrijdag ')
    }
  }
}

domain.init()