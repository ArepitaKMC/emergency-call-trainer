# 🚨 911 Phone Simulator (Para Niños)

Un simulador de llamadas de emergencia 911 realista, accesible y diseñado específicamente para niños con discapacidades del desarrollo o autismo. El objetivo es proporcionar un entorno seguro y controlado para practicar una de las habilidades más críticas de la vida real.

![Vista Previa del Simulador](file:///C:/Users/Anjali/.gemini/antigravity/brain/8649a741-e3c4-4d94-a373-9d13d3921a2a/vad_test_initial_1771736149906.png)

## 🌟 Características Principales

### 🎙️ Detección de Voz Inteligente (VAD)
A diferencia de otros simuladores con tiempos fijos, este app utiliza la **Web Audio API** para "escuchar" al niño. 
- **Interacción Natural**: El oficial de policía espera a que el niño termine de hablar antes de responder.
- **Sensibilidad Optimizada**: Configurado para detectar voces suaves y palabras cortas.
- **Visualizador en Tiempo Real**: Barras dinámicas que indican al niño que está siendo "escuchado".

### ♿ Diseño de Alta Accesibilidad
- **Sin Lectura**: Interfaz basada totalmente en iconos y señales visuales.
- **Botones Grandes**: Área de contacto amplia para facilitar la precisión motriz.
- **Feedback Inmediato**: Sonidos de teclas, animaciones de éxito y corrección visual de errores.
- **Idioma**: Totalmente en **Español**.

### 📱 Realismo Smartphone
- **Teclado Alfanumérico**: Incluye letras (ABC, DEF) bajo los números como un teléfono real.
- **Botón de Borrar (⌫)**: Permite corregir errores antes de llamar.
- **Función de Colgar**: El botón cambia a rojo durante la llamada, permitiendo practicar cómo terminar o cancelar una comunicación.

## 🛠️ Tecnologías Utilizadas
- **HTML5 / CSS3 / JavaScript (Vanilla)**
- **Web Audio API**: Procesamiento de audio en tiempo real para el detector de voz y amplificador de ganancia.
- **Vercel**: Deployment y hosting.

## 🔒 Privacidad y Seguridad
La privacidad del menor es nuestra máxima prioridad:
- **Procesamiento Local**: El detector de voz funciona 100% en el navegador del usuario.
- **Sin Grabaciones**: No se almacena, graba ni envía ningún audio a ningún servidor.
- **Seguridad**: Una vez cerrada la pestaña, el acceso al micrófono se corta inmediatamente.

## 🚀 Instalación y Uso

1.  Clona este repositorio:
    ```bash
    git clone https://github.com/tu-usuario/911-ayuda-ninos.git
    ```
2.  Abre `index.html` en cualquier navegador moderno (Chrome, Edge o Safari).
3.  **Importante**: Debes permitir el acceso al micrófono cuando el navegador lo solicite para que la interacción por voz funcione.

## 👨‍👩‍👧‍👦 Créditos
Diseñado con amor para tutores, padres y educadores que trabajan en la comunicación funcional y habilidades de seguridad.
