import { useState, useMemo, useEffect } from "react";
import Result from "./Result";
const synth = window.speechSynthesis;

function App() {
  const voices = useMemo(() => synth.getVoices(), []);
  const [voiceSelected, setVoiceSelected] = useState("Google US English");
  const [text, setText] = useState("");
  const [isSpeaking, setIsSpeaking] = useState("");
  const [meanings, setMeaning] = useState([]);
  const [phonetics, setPhonetics] = useState([]);
  const [word, setWord] = useState("");
  const [error, setError] = useState("");

  const dictionaryApi = (text) => {
    let url = `https://api.dictionaryapi.dev/api/v2/entries/en/${text}`;
    fetch(url)
      .then((res) => res.json())
      .then(result => {
        setMeaning(result[0].meanings);
        setPhonetics(result[0].phonetics);
        setWord(result[0].word);
        setError("");
      })
      .catch((err) => setError(err));
  };

  const reset=()=>{
    setIsSpeaking("");
    setError("");
    setMeaning([]);
    setPhonetics([]);
    setWord("");
  }
  useEffect(() => {
    if (!text.trim()) return reset();
    const debounce=setTimeout(()=>{

      dictionaryApi(text);
    },1000)
    return()=>clearTimeout(debounce);
  }, [text]);

  const startSpeech = (text) => {
    const uttrance = new SpeechSynthesisUtterance(text);
    const voice = voices.find((voice) => voice.name === voiceSelected);
    uttrance.voice = voice;

    synth.speak(uttrance);
  };

  const handleSpeech = () => {
    if (!text.trim()) return;
    if (!synth.speaking) {
      startSpeech(text);
      setIsSpeaking("speak");
    } else {
      synth.cancel();
    }

    setInterval(() => {
      if (!synth.speaking) {
        setIsSpeaking("");
      }
    }, 100);
  };

  return (
    <div className="container">
      <h1>English Dictionary</h1>
      <form action="">
        <div className="row">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            cols="30"
            rows="4"
            placeholder="Enter text"
          />

          <div className="voice-icons">
            <div className="select-voices">
              <select
                value={voiceSelected}
                onChange={(e) => setVoiceSelected(e.target.value)}
              >
                {voices.map((voice) => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name}
                  </option>
                ))}
              </select>
            </div>
            <i
              className={`fa-solid fa-volume-high ${isSpeaking}`}
              onClick={handleSpeech}
            />
          </div>
        </div>
      </form>

      {
        (text.trim()!=="" && !error)&&

        <Result
          word={word}
          phonetics={phonetics}
          meanings={meanings}
          setText={text}
        />

      }
    </div>
  );
}

export default App;
