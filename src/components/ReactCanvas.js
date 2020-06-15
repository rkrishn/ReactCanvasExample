import React, {useEffect, useState, useRef} from 'react';
import CanvasAPI from '../api/convasAPI';

const ReactCanvas = () => {
    const canvasRef = useRef(null);
    const [ctx, setCtx] = useState();
    const [offsetX, setOffsetX] = useState();
    const [offsetY, setOffsetY] = useState();
    const [scissor, setScissor] = useState(false);
    const [triangleCut, setTriangleCut] = useState(false);
    const [rectCut, setRectCut] = useState(false);
    const [circleCut, setCircleCut] = useState(false);
    const [eraser, setEraser] = useState(false);
    const [glue, setGlue] = useState(false);
    const [circleErased, setCircleErased] = useState(false);
    const [rectErased, setRectErased] = useState(false);
    const [triangleErased, setTriangleErased] = useState(false);

    let mouseIsDown = false;
    let lastX = 0;
    let lastY = 0;

    let canvasToolbar = [];

    const resetToolBar = () => {
        canvasToolbar = [];
        createToolBar();
        drawAllToolBars(ctx);
    }

    const createToolBar = () => {
        const {data: {toolBarItems}} = CanvasAPI;
        console.log("Toolbar Items: ", toolBarItems);
        for(let item in toolBarItems){
            let toolBar = toolBarItems[item];
            toolBar.right = toolBar.x + toolBar.width;
            toolBar.bottom = toolBar.y + toolBar.height;
            canvasToolbar.push(toolBar);
        }
        console.log("CanvasTools: ", canvasToolbar);
    }

    createToolBar();

    const drawAllShips = (ctx, toolType, objType, resetTool = false)  => {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        console.log("Selected Tool: ", toolType);

        //Circle
        if(!circleErased){
            if(toolType === "eraser" && objType === 'circle'){
                //Do not draw a circle hide it
                setCircleErased(true);
            }else{
                if(objType === "circle" && (toolType === "scissor" || toolType === "glue")){
                    drawCircle(ctx, toolType);
                }else{
                    drawCircle(ctx, "none");
                }
            }
        }

        //Rectangle
        if(!rectErased){
            if(toolType === "eraser" && objType === 'rectangle'){
                //Do not draw a reactangle hide it
                setRectErased(true);
            }else{
                if(objType === "rectangle" && (toolType === "scissor" || toolType === "glue")){
                    drawRectangle(ctx, toolType);
                }else{
                    drawRectangle(ctx, "none");
                }
            }
        }

        //Triangle
        if(!triangleErased){
            if(toolType === "eraser" && objType === 'triangle'){
                //Do not draw a reactangle hide it
                setTriangleErased(true);
            }else{
                if(objType === "triangle" && (toolType === "scissor" || toolType === "glue")){
                    drawTriangle(ctx, toolType);
                }else{
                    drawTriangle(ctx, "none");
                }
            }
        }

        //drawAllToolBars(ctx, toolType, objType);
        if(resetTool){
            resetToolBar();
        }
        drawAllToolBars(ctx, toolType, objType);
    }

    const drawAllToolBars = (ctx) => {
        for (let i = 0; i < canvasToolbar.length; i++) {
            let toolBar = canvasToolbar[i];
            drawShip(ctx, toolBar);
            ctx.fillStyle = toolBar.fill;
            ctx.font = "20px Verdana";
            ctx.fillText(toolBar.type, toolBar.x, toolBar.y - 10);
            ctx.fill();
            ctx.stroke();
        }
    }
    
    const drawShip = (ctx, toolBar) => {
        ctx.beginPath();
        ctx.moveTo(toolBar.x, toolBar.y);
        ctx.lineTo(toolBar.right, toolBar.y);
        ctx.lineTo(toolBar.right + 10, toolBar.y + toolBar.height / 2);
        ctx.lineTo(toolBar.right, toolBar.bottom);
        ctx.lineTo(toolBar.x, toolBar.bottom);
        ctx.closePath();
    }

    const handleMouseDown = (e) => {
        let mouseX = parseInt(e.clientX - offsetX);
        let mouseY = parseInt(e.clientY - offsetY);
    
        // mousedown stuff here
        lastX = mouseX;
        lastY = mouseY;
        mouseIsDown = true;
    
    }
    
    const handleMouseUp = (e) => {
        // mouseup stuff here
        mouseIsDown = false;
    }
    
    const handleMouseMove = (e) => {
        if (!mouseIsDown) {
            return;
        }
    
        let mouseX = parseInt(e.clientX - offsetX);
        let mouseY = parseInt(e.clientY - offsetY);

        console.log("ToolBarItems: ", canvasToolbar);
        // mousemove stuff here
        for (let i = 0; i < canvasToolbar.length; i++) {
            let toolBar = canvasToolbar[i];
            drawShip(ctx, toolBar);
            if (ctx.isPointInPath(lastX, lastY)) {
                toolBar.x += (mouseX - lastX);
                toolBar.y += (mouseY - lastY);
                toolBar.right = toolBar.x + toolBar.width;
                toolBar.bottom = toolBar.y + toolBar.height;
                if(toolBar.type === 'scissor'){
                    setScissor(true);
                    setEraser(false);
                    setGlue(false);
                }else if(toolBar.type === 'eraser'){
                    setScissor(false);
                    setEraser(true);
                    setGlue(false);
                }else if(toolBar.type === 'glue'){
                    setScissor(false);
                    setEraser(false);
                    setGlue(true);
                }else{
                    setScissor(false);
                    setEraser(false);
                    setGlue(false);
                }
            }
        }

        lastX = mouseX;
        lastY = mouseY;

        if(scissor){
            drawAllShips(ctx, "scissor");
        }else if(eraser){
            drawAllShips(ctx, "eraser");
        }else if(glue){
            drawAllShips(ctx, "glue");
        }else{
            drawAllShips(ctx, "none");
        }
        
        
        var dx = lastX - 75,
            dy = lastY - 75,
            dist = Math.abs(Math.sqrt(dx*dx + dy*dy));

        if (dist <= 35) { 
            console.log('Circle IT IS !!: ');
            console.log('Tool Selected: ', scissor);
            setCircleCut(false);
            if(scissor){
                //Cut the Circle
                setCircleCut(true);
                drawAllShips(ctx, "scissor", "circle", true);
            }else if(eraser){
                drawAllShips(ctx, "eraser", "circle", true);
            }else if(glue){
                drawAllShips(ctx, "glue", "circle", true);
            }else{
                drawAllShips(ctx, "none", "circle", false);
            }
        };

        if (lastY > 200 && lastY < 200 + 150 && lastX > 30 && lastX < 30 + 200) {
            console.log('Rectangle IT IS !!');
            setRectCut(false);
            if(scissor){
                //Cut the Circle
                setRectCut(true);
                drawAllShips(ctx, "scissor", "rectangle", true);
            }else if(eraser){
                drawAllShips(ctx, "eraser", "rectangle", true);
            }else if(glue){
                drawAllShips(ctx, "glue", "rectangle", true);
            }else{
                drawAllShips(ctx, "none", "rectangle", false);
            }
        }

        //Recreate Triangle to detect the path
        if(!triangleErased){
            const triangleCtx = drawTriangle(ctx);
            if(triangleCtx.isPointInPath(lastX, lastY)){
                console.log('Trianle IT IS !!');
                //drawAllShips(ctx, false, false, true, true);
                setTriangleCut(false);
                if(scissor){
                    //Cut the Circle
                    setTriangleCut(true);
                    drawAllShips(ctx, "scissor", "triangle", true);
                }else if(eraser){
                    drawAllShips(ctx, "eraser", "triangle", true);
                }else if(glue){
                    drawAllShips(ctx, "glue", "triangle", true);
                }else{
                    drawAllShips(ctx, "none", "triangle", false);
                }
            }
        }
        
    }

    const drawCircle = (context, type) => {
        context.beginPath();
        if((type === "scissor" || circleCut) && (type !== 'glue')){
            setCircleCut(true);
            context.arc(75, 75, 50, 0, (Math.PI/180) * 180, true); // Outer circle
        }else{
            setCircleCut(false);
            context.arc(75, 75, 50, 0, Math.PI * 2, true); // Outer circle
        }
        context.fillStyle = 'rgb(253, 191, 45)';
        context.fill();
        context.stroke();

        if((type === "scissor" || circleCut) && (type !== 'glue')){
            context.beginPath();
            context.arc(75, 90, 50, 0, (Math.PI/180) * 180, false); // Outer circle
            context.fillStyle = 'rgb(253, 191, 45)';
            context.fill();
            context.stroke();
        }

        return context;
    }

    const drawRectangle = (context, type) => {
        context.beginPath(); 
        if((type === "scissor" || rectCut) && (type !== 'glue')){
            setRectCut(true);
            context.rect(30, 200, 200, 75);    
        }else{
            setRectCut(false);
            context.rect(30, 200, 200, 150);
        }
        context.fillStyle = 'rgb(235, 125, 60)';
        context.fill();
        context.stroke();

        
        if((type === "scissor" || rectCut) && (type !== 'glue')){
            context.beginPath();
            context.rect(30, 300, 200, 75);    
            context.fillStyle = 'rgb(235, 125, 60)';
            context.fill();
            context.stroke();
        }

        return context;
    }

    const drawTriangle = (context, type) => {
        let height = 200 * Math.cos(Math.PI / 6);
        context.beginPath();
        console.log("Triangle ToolTYPE: ", type);
        if((type === "scissor" || triangleCut) && (type !== 'glue')){
            setTriangleCut(true);
            context.moveTo(420, 250);
            context.lineTo(520, 250);
            context.lineTo(420, 250 - height);
            context.closePath();
            context.fillStyle = 'rgb(114, 171, 77)';
            context.fill();
            context.stroke();

            context.moveTo(300, 250);
            context.lineTo(400, 250);
            context.lineTo(400, 250 - height);
            context.closePath();
            context.fillStyle = 'rgb(114, 171, 77)';
            context.fill();
            context.stroke();
        }else{
            setTriangleCut(false);
            context.moveTo(300, 250);
            context.lineTo(500, 250);
            context.lineTo(400, 250 - height);
            context.closePath();
            context.fillStyle = 'rgb(114, 171, 77)';
            context.fill();
            context.stroke();
        }

        return context;
    }
    

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        setCtx(context);
        setOffsetX(canvas.offsetLeft);
        setOffsetY(canvas.offsetTop);

        //Circle
        drawCircle(context, "none");
        //draw(ctx, {x: 100, y: 100})

        //Rectangle
        drawRectangle(context, "none");

        //Triangle
        drawTriangle(context, "none");

        //drawAllShips(context);
        drawAllToolBars(context);

    }, []);

    return(
        <canvas
            ref={canvasRef}
            width={600}
            height={400}
            //onClick={resetToolBar}
            onMouseDown={(e) => handleMouseDown(e)}
            onMouseMove={(e) => handleMouseMove(e)}
            onMouseUp={(e) => handleMouseUp(e)}
            style={{backgroundColor: 'rgb(70, 116, 193)'}}
      />
    )
}

export default ReactCanvas;