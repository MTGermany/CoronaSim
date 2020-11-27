
//#################################################################
// implementation of redirect buttons on the simulation html pages
//#################################################################

function myRedirectEng(){
  var path = window.location.pathname;
  var page = path.split("/").pop(); // cut away the path
  var base=page.substring(0, page.length-5);
  var newpage=base+"_eng.html";
  console.log("page=",page," base=",base," newpage=",newpage);
  window.location.href = "./"+newpage;
}

function myRedirectGer(){
  var path = window.location.pathname;
  var page = path.split("/").pop();
  var base=page.substring(0, page.length-9);
  var newpage=base+".html";
  console.log("page=",page," base=",base," newpage=",newpage);
  window.location.href = "./"+newpage;
}

