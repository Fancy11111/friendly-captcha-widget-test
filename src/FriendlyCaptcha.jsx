import { useCallback, useEffect, useRef, useState } from "react";
import { WidgetInstance } from 'friendly-challenge';

const FriendlyCaptcha = (props) => {
  const container = useRef();
  const widget = useRef();
  const [state, setState] = useState({fails: 0, success: 0})

  const doneCallback = useCallback((solution) => {
    console.log('Captcha was solved. The form can be submitted.');
    console.log(solution);
    fetch('https://api.friendlycaptcha.com/api/v1/siteverify',{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify({
        sitekey: props.sitekey, 
        secret: props.secret, 
        solution}
      )
    }).then(async res => {
      const parsed = await res.json();
      if(parsed.success) {
        setState((prev) => {return {...prev, success: prev.success + 1}});
      }
      else {
        setState((prev) => {return {...prev, fails: prev.fails + 1}});
      }
      widget.current.reset();
    })
  }, [props.sitekey, props.secret]);

  const errorCallback = (err) => {
    console.log('There was an error when trying to solve the Captcha.');
    console.log(err);
  }

  useEffect(() => {
    if (!widget.current && container.current) {
      widget.current = new WidgetInstance(container.current, { 
        startMode: "auto",
        doneCallback: doneCallback,
        errorCallback: errorCallback 
      });
    }

    return () => {
      if (widget.current !== undefined) widget.current.reset();
    }
  }, [container, doneCallback]);

  return (
    <>
      <div>Success: {state.success}; Fails: {state.fails}</div>
      <div ref={container} className="frc-captcha" data-sitekey={props.sitekey} />
    </>
  );
}

export default FriendlyCaptcha;