
var gui={
   texture : {text:"Marble", value:0},
   octaves : {value:10, min:1, max:10, step:1, text:"octaves"}
}


var lspc  = '\xa0'.repeat(10)
var llspc = '\xa0'.repeat(40)

//=============================================================
function initGui()
{
   var body = document.getElementsByClassName('gui')[0];

   var table = document.createElement('table');
   body.appendChild(table)

   gui.guiBody = document.createElement('tbody');
   table.appendChild(gui.guiBody);

   sec=gui_section("Scene Options")
   gui_select(sec)
   gui_vspace(sec)
   gui_slider(sec,gui.octaves)
   gui_vspace(sec)
}


//=============================================================
function insert(sec,fimg,val){
	var img = document.createElement("img")
	img.src = fimg
	img.setAttribute('width', '122');
	img.setAttribute('height', '122');
	img.addEventListener('click', e=>{ gui.serie.value=val })
	sec.appendChild(img)
	sec.appendChild(document.createTextNode(' '))
}



//=============================================================
function gui_section(title)
{
   var tr = document.createElement('tr');
   gui.guiBody.appendChild(tr);

   var td = document.createElement('td');
   td.appendChild(document.createTextNode(title))
   tr.appendChild(td)

   var tr = document.createElement('tr');
   gui.guiBody.appendChild(tr);
   td = document.createElement('td');
   tr.appendChild(td)

   return td;
}



//=============================================================
function gui_vspace(sec)
{
   var par=document.createElement('p')
      par.className='p'
   sec.appendChild(par)
}




//=============================================================
function gui_text(sec,text)
{
   sec.appendChild(document.createTextNode(text))
   sec.appendChild(document.createElement('br'))
}


//=============================================================
function gui_info(sec,obj)
{
   obj.id=document.createTextNode('')
   gui_info_update(obj)
   sec.appendChild(obj.id);
   sec.appendChild(document.createElement('br'))
}


//=============================================================
function gui_info_update(obj)
{
   obj.id.nodeValue=obj.text+': '+obj.value+' '+obj.unit
}


//=============================================================
function gui_checkbox(sec,obj)
{
   var box = document.createElement('input')
      box.type = 'checkbox'
      box.className = 'checkbox';
      box.checked = obj.value
      box.addEventListener(
         'change',
         function() {
            obj.value=box.checked
         }
      )

   var label=document.createElement('label')
      label.innerHTML=obj.text
      label.className='label'

   sec.appendChild(box)
   sec.appendChild(label)
   sec.appendChild(document.createElement('br'))
}

//=============================================================
function gui_slider(sec,obj)
{
   var slider = document.createElement('input');
   slider.type = 'range';
   slider.className = 'slider';
   slider.min = obj.min;
   slider.max = obj.max;
   slider.value = obj.value;
   slider.step = obj.step;
   slider.id = obj.text;
   obj.slider=slider;

   txt=document.createTextNode(obj.text+' : '+slider.value)
   obj.slider.txt=txt

   obj.slider.addEventListener(
      'input',
      function() {
         obj.value=obj.slider.value
			obj.slider.txt.nodeValue=slider.id+': '+slider.value
      }
   )


   sec.appendChild(txt)
   sec.appendChild(slider)
   sec.appendChild(document.createElement('br'))
}

//=============================================================
function gui_slider_update(obj,val)
{
	obj.value=val;
	obj.slider.txt.nodeValue=obj.text+' : '+val;
	obj.slider.value=val;
}
function gui_select(sec) {
   var select = document.createElement("SELECT"); // Crée un bouton HTML
   var options = ["Marble", "Wood", "Island", "Sun", "River"];
   options.forEach(function (element, key) {
      select[key] = new Option(element, key, false,element==gui.texture);
   });
   select.addEventListener(
      'click',
      function() {
         for(element of select){
            if(element.selected){
               gui.texture.text = element.text;
               gui.texture.value = element.value;
            }
         }
      }
   );
   select.className = "gui-select"; // Ajoute une classe CSS (facultatif)
   //select.addEventListener("click", callback); // Associe l'événement "click" à une fonction
   sec.appendChild(select); // Ajoute le bouton à la section donnée
   sec.appendChild(document.createElement("br")); // Ajoute un saut de ligne
}





