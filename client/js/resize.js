/*  makes sure canvas size is always full screen
    maintains aspect ratio for content drawing  */

export function monitorSizeChange() {
    //initialize canvas to window dimension
    context.canvas.width = window.innerWidth;
    context.canvas.height = window.innerHeight;
    
    //resize canvas upon window is being resized
    window.onresize = () => {
        context.canvas.width = window.innerWidth;
        context.canvas.height = window.innerHeight;
    }
}