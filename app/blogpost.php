<?php

$name = $_GET['b'];

Header( "HTTP/1.1 301 Moved Permanently" ); 

switch ($name) {
    case "rob":
        Header( "Location: http://www.daarzitmeerachter.nl/praktijk/18-03-2015-meer-over-rob-winkens" ); 
        break;
    case "jeroen":
        Header( "Location: http://www.daarzitmeerachter.nl/praktijk/18-03-2015-meer-over-jeroen-boonstra" ); 
        break;
    case "lieveke":
        Header( "Location: http://www.daarzitmeerachter.nl/praktijk/19-03-2015-hoe-ver-moet-je-spanningen-laten-oplopen" ); 
        break;
    case "arie":
        Header( "Location: http://www.daarzitmeerachter.nl/praktijk/19-03-2015-wat-doe-je-met-smeulend-vuur" ); 
        break;
    case "petra":
        Header( "Location: http://www.daarzitmeerachter.nl/praktijk/18-03-2015-meer-over-petra-harmsen" ); 
        break;
    case "martha":
        Header( "Location: http://www.daarzitmeerachter.nl/praktijk/18-03-2015-meer-over-martha-vallinga" ); 
        break; 
    case "caroline":
        Header( "Location: http://www.daarzitmeerachter.nl/praktijk/18-03-2015-meer-over-caroline-smeets" ); 
        break;                               
    default:
    Header( "Location: http://www.daarzitmeerachter.nl/praktijk" );
}

?> 