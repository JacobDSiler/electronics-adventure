/* Electronics Adventure - Quest 1B: Volts, Amps & Ohms. Inserted after Quest 1 (its id is 8 so saved progress for the other quests is untouched). */
(function () {
  'use strict';
  const EA = window.EA;
  const unit = {
    id: 8, num: '1B', title: 'Volts, Amps & Ohms', emoji: '🌊', color: '#5E9C2F', tagline: 'Push, flow and squeeze: Ohm’s Law',
    bigQuestion: 'How do we know which resistor to use, and why do some parts need more electricity than others?',
    answer: 'Electricity follows one rule: V = I × R. Push (volts), flow (amps) and squeeze (ohms) always fit together that way, and we use it to choose parts.',
    story: 'The Water Slide Park has a problem: some slides are too fast and some are only a trickle! Learn the secret rule of push, flow and squeeze and you can fix every slide, and every circuit.',
    mnemonic: {
      phrase: 'V I R: “Very Important Rule: cover what you want to find!”',
      lines: ['V is the PUSH (volts). I is the FLOW (amps). R is the SQUEEZE (ohms).',
        'Cover the one you want. Cover V and see I × R. Cover I and see V ÷ R. Cover R and see V ÷ I.',
        'Water slide: a taller tank (more V) pushes harder. A narrower pipe (more R) lets less through.',
        'Power in watts: P = V × I. Battery hours = mAh ÷ mA.']
    },
    labs: ['parts', 'water', 'ohmtri', 'colorcode', 'ledres', 'divider', 'power'],
    sessions: [
      { title: 'Part safari', kid: 'Lay out your parts on a tray. Name each one, say what it does, and sort them: which have two legs? three legs? which make light, sound or movement?',
        parent: 'Make a tray with the real parts: battery holder, wire, switch, bulb, LED, buzzer, motor, push button. Younger girls name and sort them; older girls add resistor, LDR, potentiometer, capacitor, transistor and a chip. Make little "job cards" and match them. Safety: count parts out and in; nothing small near the 2 and 3 year olds without a grown-up.',
        parts: ['Tray or muffin tin', 'One of each part', 'Job cards'], sprout: 'Hold the battery and say "push!". Find the big wire, switch and light with a grown-up.' },
      { title: 'Water-bottle slides', kid: 'Poke holes in a bottle (a grown-up helps) and fill it with water. Does a taller bottle shoot water further? What if the hole is bigger? What about three holes?',
        parent: 'Do this outside or over a tray. Use two clean plastic bottles with a small hole near the bottom (adult pokes with a pin or nail). Tall water = more pressure (volts): the stream shoots further. A bigger hole or three holes = less squeeze (lower resistance), so more flow. Say the translations aloud: pressure = voltage, flow = current, narrow hole = resistance.',
        parts: ['2 plastic bottles', 'Pin or nail (adult)', 'Jug of water', 'Tray'], sprout: 'Splash play: pour water through a funnel and then a wide tube. Which is faster?' },
      { title: 'Read the stripes', kid: 'Decode the coloured bands on real resistors with the colour chart and the rhyme. Then switch the multimeter to ohms and check your answer!',
        parent: 'Give each girl 6 to 8 resistors (100, 220, 330, 470, 1k, 4.7k, 10k, 100k). They decode with the chart and "Big Brown Rabbits Often Yell Get Back, Very Grumpy Wolf". Check each with the multimeter on the ohms range. Notes: gold band = 5% tolerance, so the meter may read a little off. Bigger numbers = bigger squeeze.',
        parts: ['Resistors', 'Multimeter', 'Colour chart'], sprout: 'Sort resistors by colour into bowls (rainbow sorting).' },
      { title: 'Bright and dim LEDs', kid: 'Predict first: which resistor makes the LED brightest? Try 220, 330, 1k and 10k. Then measure the voltage across each resistor and work out the current.',
        parent: 'Use the 3 x AA holder (4.5 V) and a red LED. Predict with I = (4.5 − 2) ÷ R: 220 Ω ≈ 11 mA, 330 Ω ≈ 7.6 mA, 1 kΩ = 2.5 mA, 10 kΩ = 0.25 mA. Compare brightness. Measure the voltage across the resistor with the multimeter (V = I × R) and check. Do not go below 150 Ω on a 4.5 V pack.',
        parts: ['3 x AA holder', 'Red LEDs', '220, 330, 1k, 10k resistors', 'Multimeter'], sprout: 'Switch a bright LED on and off while counting "one, two" aloud.' },
      { title: 'Meet the multimeter', kid: 'Measure a battery: red probe on +, black on −. Then measure the voltage across a resistor in your LED circuit. Compare with your sum!',
        parent: 'Teach volts first: DC volts range, probes across the battery or across a part (in parallel). Then ohms with the circuit unpowered. Current (amps) mode is for grown-ups only: the meter goes in the loop (series), start on the highest range, never across a battery. Keep readings in the notebook.',
        parts: ['Multimeter', 'Battery pack', 'Resistors', 'LED'], sprout: 'Watch the numbers change on the multimeter screen and read them aloud.' },
      { title: 'Knob dimmer', kid: 'Wire a potentiometer (a turning resistor) so you can dim an LED by turning the knob. What happens to the volts at the middle leg?',
        parent: 'Battery + to one outer leg of the 10 kΩ potentiometer, battery − to the other. From the middle leg (wiper) go through a 330 Ω resistor to the LED and back to battery −. Turn the knob to dim. Measure the wiper voltage with the multimeter as the girls turn it: it moves between 0 V and the battery voltage (a voltage divider).',
        parts: ['Potentiometer (10 kΩ)', 'LED + 330 Ω', '3 x AA holder', 'Multimeter'], sprout: 'Turn a big radio or toy volume knob and listen.' },
      { title: 'Design a safe night light', kid: 'Pick a battery and an LED colour. Use your triangle to choose the resistor. Build it, measure it, and show the family your calculation.',
        parent: 'Each girl chooses a supply (4.5 V pack, or USB 5 V), an LED colour, and a target current (10 to 15 mA). They calculate R = (Vs − Vf) ÷ I, pick the nearest standard value up, build it, and measure. Notebook page: circuit drawing, the sum, predicted and measured current. Older girls explain it to a younger sibling.',
        parts: ['Battery or USB supply', 'LEDs', 'Resistors', 'Switch', 'Multimeter'], sprout: 'Press the switch on the finished night light and say "light on!"' }
    ],
    vocab: [
      { w: 'voltage', d: 'The push that makes electricity move. Measured in volts (V).' }, { w: 'current', d: 'How much electricity flows past each second. Measured in amps (A) or milliamps (mA).' },
      { w: 'resistance', d: 'The squeeze that holds the flow back. Measured in ohms (Ω).' }, { w: 'Ohm’s Law', d: 'V = I × R. Push equals flow times squeeze.' },
      { w: 'resistor', d: 'A part that adds resistance. It protects LEDs and sets the flow.' }, { w: 'multimeter', d: 'A tool that measures volts, ohms and sometimes amps.' },
      { w: 'potentiometer', d: 'A resistor you can turn with a knob. It makes dimmers and volume controls.' }, { w: 'power', d: 'How fast energy is used. Watts (W) = volts × amps.' }
    ],
    quiz: [
      { q: 'What does a battery’s voltage tell us?', opts: ['How hard it pushes electricity', 'How much it weighs', 'How hot it is', 'What colour it is'], a: 0, why: 'Voltage is the push, like the height of the water tank.' },
      { q: 'In Ohm’s Law (V = I × R), what does I stand for?', opts: ['Current (the flow)', 'Insulator', 'Ink', 'Iron'], a: 0, why: 'I is current, measured in amps. V is voltage, R is resistance.' },
      { q: 'You squeeze a pipe so it is narrower. What happens to the flow?', opts: ['It gets smaller', 'It gets bigger', 'It stays the same', 'It turns into sand'], a: 0, why: 'More squeeze (resistance) means less flow, just like a narrow slide.' },
      { q: 'The current is 2 A and the resistance is 3 Ω. What is the voltage?', opts: ['6 V', '5 V', '1 V', '9 V'], a: 0, why: 'V = I × R = 2 × 3 = 6 V.' },
      { q: 'A 6 V battery is joined to a 2 Ω resistor. What is the current?', opts: ['3 A', '12 A', '4 A', '8 A'], a: 0, why: 'I = V ÷ R = 6 ÷ 2 = 3 A.' },
      { q: 'An LED needs 10 mA from a 5 V supply and drops 2 V. Which resistor?', opts: ['300 Ω', '30 Ω', '3 kΩ', '30 kΩ'], a: 0, why: 'R = (5 − 2) ÷ 0.010 = 300 Ω.' },
      { q: 'A resistor has brown, black, red bands. What is it?', opts: ['1 kΩ', '10 Ω', '102 Ω', '10 kΩ'], a: 0, why: 'Brown 1, black 0, red = two zeros: 10 followed by 00 = 1000 Ω = 1 kΩ.' },
      { q: 'You double the voltage but keep the same resistor. What happens to the current?', opts: ['It doubles', 'It halves', 'It stays the same', 'It disappears'], a: 0, why: 'I = V ÷ R. Twice the push means twice the flow.' }
    ],
    badge: { name: 'Ohm Hero', emoji: '🔺', how: 'Finish every lab and pass the quiz.', earned: 'You can use V = I × R to choose the right part for a circuit!' }
  };
  EA.units.splice(1, 0, unit);
  EA.PARTS.push({ id: 'pot', unit: '1B', name: 'Potentiometers (10 kΩ) and a few extra resistors (150 Ω to 10 kΩ)', qty: '3 + a few', cost: '3 EUR', have: false });
})();
