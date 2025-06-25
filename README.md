# midi-server-carlos-2
Manda comandos midi CC usando node y html

Ejercicio para Practicas Profesionalizantes 2 ISFT151

Se monta un servidor web con node
el cual detecta las salidas midi del sistema y pregunta cual se usara (desde el backend)
tambien detecta la ip de la maquina host para compartirla al html (frontend) y poder comunicarse a traves de la misma red wifi

La idea es tener un dispositvo midi conectado a la maquina host y que cualquier computadora o telefono smart conectado a la misma red pueda enviarle señales CC que permitiran el cambio de los parametros del controlador midi haciendolo notorio en su salida sonora.
La implementacion del html es una forma grafica y ludica donde cada vez que se hace click en un circulo este desaparece mostrando un emoji y manda aleatoriamente los valores CC
