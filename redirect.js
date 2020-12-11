
//#################################################################
// implementation of redirect buttons on the simulation html pages
//#################################################################

// since new pages are loaded, all memory is sadly lost! always starts with
// Germany, standard view ...

function myRedirectEng(){
  var path = window.location.pathname;
  var page = path.split("/").pop(); // cut away the path
  var base=page.substring(0, page.length-5);
  var newpage=(base==="") ? "index_eng.html" : base+"_eng.html";
  console.log("page=",page," base=",base," newpage=",newpage);
  window.location.href = newpage; // attention: NOT with "./"+ Fck bug server
}

function myRedirectGer(){
  var path = window.location.pathname;
  var page = path.split("/").pop();
  var base=page.substring(0, page.length-9);
  var newpage=(base==="") ? "index.html" : base+".html";
  console.log("page=",page," base=",base," newpage=",newpage);
  window.location.href = newpage; // attention: NOT with "./"+ Fck bug server
}

