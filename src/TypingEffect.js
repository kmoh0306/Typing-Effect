import React, { useState, useEffect, useRef } from 'react';
import {chosung, jungsung, jongsung} from './Type.js'



function isHangle(charCode) {
  if(charCode >= 0xac00 && charCode <= 0xd7a3) return true;
  return false;
}

function combineCharCode(returnText, cho, jung, jong, index, splice) {
  return returnText.splice(
    index, splice, String.fromCharCode(
      0xac00 + cho * Math.floor(0xae4c - 0xac00) 
             + jung * Math.floor(0xac1c - 0xac00)
             + jong
    ));
}

function combineText(text) {
  let cho = -1;
  let jung = -1;
  let jong = -1;
  let decompose = '';
  let currentText = '';
  let nextText = '';
  let index;

  for (index = 0; index < text.length; index += 1) {
    currentText = text.charAt(index);
    nextText = text.charAt(index + 1);
    decompose = decomposeText(currentText);

    const tempCho = decompose.charAt(0);
    const tempJung = decompose.charAt(1);
    const tempJong = decompose.charAt(2);

    if (
      // 한글 타이핑이 가능한 경우 INDEX 반환 후 반복문 종료
      !(
        (chosung.includes(currentText) && chosung.includes(nextText)) || // 자음 + 자음
        (tempCho !== '' && tempJung !== '' && tempJong !== '') || // 자음 + 모음 + 자음
        (tempCho !== '' && tempJung !== '' && tempJong === '' && chosung.indexOf(nextText) === -1) || // 자음 + 모음 + 자음이 아닌 문자
        currentText === ' ' || // 공백
        nextText === ' ' || // 공백
        !(
          // 한글이 아닌 문자
          (
            isHangle(text.charCodeAt(index)) ||
            chosung.includes(currentText) ||
            jongsung.includes(currentText) ||
            jungsung.includes(currentText)
          )
        )
      )
    ) {
      cho = chosung.indexOf(tempCho || currentText);
      jung = jungsung.indexOf(tempJung);
      jong = jongsung.indexOf(tempJong);
      break;
    }
  }

  const nextHangul = nextText || currentText;

  if (nextHangul === '') return text;

  const returnText = [...text];
  
  if (jungsung.includes(currentText)) {
    const prevDecompose = decomposeText(text.charAt(index - 1));

    cho = chosung.indexOf(prevDecompose.charAt(0));
    jung = jungsung.indexOf(prevDecompose.charAt(1));
    combineCharCode({
      returnText,
      cho,
      jung,
      jong: 0,
      index: index - 1,
      splice: 1,
    });

    cho = chosung.indexOf(prevDecompose.charAt(2));
    jung = jungsung.indexOf(currentText);
    combineCharCode({
      returnText,
      cho,
      jung,
      jong,
      index,
      splice: 1,
    });
  } else if (jungsung.includes(nextHangul)) {
    jung = jungsung.indexOf(nextHangul);
    combineCharCode({
      returnText,
      cho,
      jung,
      jong,
      index,
      splice: 2,
    });
  } else if (jungsung.indexOf(decompose.charAt(decompose.length - 1)) !== -1) {
    cho = chosung.indexOf(decompose.charAt(0));
    jung = jungsung.indexOf(decompose.charAt(decompose.length - 1));
    jong = jongsung.indexOf(nextHangul);
    combineCharCode({
      returnText,
      cho,
      jung,
      jong,
      index,
      splice: 2,
    });
  }
  return returnText.join('');
}

function decomposeText(text) { 
  let returnText = ''; 
  
  for (let i = 0; i < text.length; i += 1) {
    const char = text.charAt(i); 
    const code = char.charCodeAt(0); 
    
    if (isHangle(code)) { 
      const currentHangul = char.charCodeAt(0) - 0xac00; 
      const cho = Math.floor(currentHangul / 21 / 28); 
      const jung = Math.floor(currentHangul / 28) % 21; 
      const jong = currentHangul % 28; 
      returnText += `${chosung[cho]}${jungsung[jung]}${jongsung[jong]}`; 
    } else { 
      returnText += char; 
    } 
  } 
  return returnText; 
}

const TypingComponent = ({inputText, typingSpeed }) => {
  const [text, setText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const textToType = decomposeText(inputText); // Replace with your desired text
    
    const timer = setTimeout(() => {
      if (index < textToType.length) {
        setText((prevText) => prevText + textToType.charAt(index));
        setIndex((prevIndex) => prevIndex + 1);
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div>
      <h1>{text}</h1>
    </div>
  );
};


export default TypingComponent;
