const { default: html } = require('./index.html');
import stringToHtml from '../../utils/stringToHtml';
import './styles.scss';


export default function createDialog({onClose, addToBody=true}={} as {onClose?():any, addToBody:boolean}){
    const elem = stringToHtml(html)
    const backdrop = elem.querySelector(".backdrop") as HTMLDivElement;
    backdrop.onclick =  function(){
        onClose && onClose();
        elem.remove();
    }
    if (addToBody){
        document.body.appendChild(elem)
    }
    function close(){
        backdrop && backdrop.click();
    }
    return {close, element:elem, container:elem.querySelector(".content") as HTMLDivElement}
}

