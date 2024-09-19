/*  plugin proposé par :
   
    Bibles et Publications Chrétiennes 
    editeurbpc.com 
   
    Reftagger.js permet d'afficher le texte d'une référence dans une tooltip    
   
   
 */
 
 
 /* TO DO 
 
	- Rendre paramétrable le nombre de verset affichés
	- Détéction et balisage plus fin des références
 */


/* function REFTAGGER 

    paramètres : 
		- ref : référence 
		- version_obj : version/traduction de la Bible 
					- JND - traduction J.N. Darby
					- DBR - traduction Darby Révisée 
*/

function reftagger( ref, version_obj ) {
    
    // recherche de la version à afficher en fonction de la page (par défaut Darby Révisée DBR)
    // création du lien vers le site 
      
    var version = 'DBR';
    var version_lien = '/bible/traduction-revisee';
   
     
    if( version_obj == 'JND' ) {
      
		version = 'JND';
		version_lien = '/bible/traduction-jn-darby';
	}
   
	var reference = ref[0].innerText;    
	var api_lien  = '/api/' + 'bible/reftagger/' + version + '/' + reference ;

	// Code forcé type data-code='XX000'  - si la référence n'est pas explicite
	// 2 char XX    - code du livre : AA (Genèse) | AB (Exode) | ... | BB (Osée) | .. | CN (Apocalypse)
	// 3 digits 000 - chapitre : 001 (chap. 1) | 010 (chap. 10)
	// Partie à adapter pour lire également depuis l'API, les codes de type XXX000 avec XXX les codes à trois lettres des abréviations anglaises.

	if( ref.attr('data-code') ) {
		
		api_lien += '+' + ref.attr('data-code');
	}

	api_lien 	 = 'https://editeurbpc.com/' + api_lien;
	version_lien = 'https://editeurbpc.com/' + version_lien;
   
   
	$.get( api_lien, function( data ) {
       
		var obj = JSON.parse( data );
		var texte = '<p>';

		var ordre = 0;

		// Affichage uniquement des trois premiers versets
		
		while( ordre < 3 && ordre < obj.texte.length ) {
           
			if( ordre > 0 ) {
               
				if( ( obj.texte[ordre].VERSET - 1 ) != obj.texte[ordre-1].VERSET ) {
                                       
					texte += '</p><p>';
				}
			}
           
			if( ordre != 0 ) {
               
				texte += ' ' ;
			}
           
			texte += '<sup>' + obj.texte[ordre].VERSET + '</sup>' + obj.texte[ordre].TEXTE;
			ordre ++;
		}
       
		// adaptation du texte du lien
		// contexte [- de 3 verset]
		// suite [+ de 3 verset]
	   
		if( obj.texte.length <= 3 ) {
           
			texte += '</p><a class="float-end pb-3" target="_blank" href="' + version_lien + '/' + obj.lien + '">Lire le contexte</a>';
		}
		else {
           
			texte += '</p><a class="float-end pb-3" target="_blank" href="' + version_lien + '/' + obj.lien + '">Lire la suite</a>';
		}
       
	   // préparation de la tooltip
	   
		if( obj.lien != '' ) {
           
			ref.css('cursor', 'pointer' );
           
			ref.popover({
				template : '<div class="popover" role="tooltip"><div class="popover-arrow"></div><h3 class="popover-header"></h3><div class="popover-body"></div></div>',
				placement : 'top',
				html : true,
				title: obj.titre,
				content: texte
			});
		}
	});    
}


$("html").on("mouseup", function (e) {
	
    var l = $(e.target);
    if (l[0].className.indexOf("popover") == -1) {
		
        $(".popover").each(function () {
			
            $(this).popover("hide");
        });
    }
});



/* Permet de baliser automatiquement les références et de faire le lien depuis les balises de classe "ref" */
// balisage automatique des références très "simples" : type (Livres + chapitre + verset (,- verset)

   
$( ".reftagger" ).html(function(i,html){
	
	return html.replace(/(((1|2|3) )?([A-ZÉ][a-zéèï]+)\s\d+\.\s\d+((-|, )\d+)?)/g,'<span class="ref">$1</span>');
});

// appel de la fonction

$('.ref').each(function(){
	
	var ref = $(this);
	reftagger( ref, version_obj );
});


