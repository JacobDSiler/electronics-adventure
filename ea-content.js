/* Electronics Adventure - curriculum content: 7 quests, missions (hands-on sessions), vocabulary, quizzes, badges,
 * plus the parts list, safety rules and the capstone ideas used by the parent area.
 * Edit this file to change wording; lab behaviour lives in ea-labs-*.js. */
(function () {
  'use strict';
  const EA = window.EA = window.EA || {};

  EA.units = [
    /* ===================== QUEST 1 ===================== */
    {
      id: 1, title: 'Light It Up', emoji: '💡', color: '#F29B38', tagline: 'Batteries, loops and solar power',
      bigQuestion: 'What does electricity need to make a light come on?',
      answer: 'A complete loop from the battery, through the light, and back again.',
      story: 'Deep inside the Great Dark Cave, the Lantern Keeper has lost her light! Learn how electricity travels in a loop so you can light the way home.',
      labs: ['loop', 'conduct', 'solar', 'series'],
      sessions: [
        { title: 'Make a light', kid: 'Use a battery pack, a resistor and an LED to make a light glow. Try flipping the LED around. Then break the loop and see what happens!',
          parent: 'Use a 3 x AA holder (4.5 V), a 330 ohm resistor and an LED. Let each girl get one light working. Test the LED both ways round to find the long (+) leg. Break the loop in different places. Rule discovered: no loop, no light. Make sure the Red-Line Rule is said aloud: never connect battery + to - with only a wire.',
          parts: ['3 x AA holder', 'LED', '330 Ω resistor', 'jumper wires'], sprout: 'Press the big switch on the Light Switch toy and say "light on!"' },
        { title: 'Conductor or insulator?', kid: 'Build a tester and try twenty things from around the house. Which ones let the light shine? Sort them into two hoops.',
          parent: 'Build the LED loop with two bare wire ends. Test about twenty items: coin, paper clip, spoon, eraser, wood, foil, pencil lead, key, plastic toy, rubber band. Sort into two hoops. Point out that pencil lead (graphite) conducts. Girls predict before testing.',
          parts: ['Tester circuit', 'Household items', '2 hoops or bowls'], sprout: 'Sort big safe objects into "sparkly metal" and "not metal" bowls.' },
        { title: 'Build a switch', kid: 'Make your own switch from a paper clip and two brass fasteners. Then try two lights: one after the other, and side by side.',
          parent: 'Switch from a paper clip and two brass fasteners (or tape and foil). Then wire two LEDs two ways: in a row (series) and side by side (parallel, each with its own resistor). Unplug one LED in each setup and compare.',
          parts: ['Paper clip', 'Brass fasteners', 'Card', '2 LEDs', 'Resistors'], sprout: 'Flick a big toy light switch on and off.' },
        { title: 'Solar power', kid: 'Connect a solar panel to a little fan or an LED. Shade the panel with your hand. What happens? Use the multimeter to see the volts!',
          parent: 'Connect a small solar panel to a motor or fan, then to an LED (some panels need strong light). Shade the panel. Use the multimeter to read volts in sun, shade and under a lamp. Ask older girls: where does the energy come from, and where did it go?',
          parts: ['Solar panel', 'Small motor or fan', 'LED', 'Multimeter'], sprout: 'Sun hunt: carry the solar fan around the house and yard to find where it spins.' },
        { title: 'Make it yours', kid: 'Build a night light, signal lamp or tiny flashlight with a switch. Decorate it and show the family!',
          parent: 'Each girl builds a night light, signal lamp or flashlight with a switch, decorates it, and demonstrates it. Notebook entry: a drawing of the loop with the battery, switch and light labelled. Older girls measure the battery, LED and resistor voltages; they should add up.',
          parts: ['Battery pack', 'LED + resistor', 'Your switch', 'Craft supplies'], sprout: 'Help decorate the lamp (big stickers only).' }
      ],
      vocab: [
        { w: 'circuit', d: 'A loop that electricity can travel round.' }, { w: 'battery', d: 'It pushes electricity around the circuit.' }, { w: 'switch', d: 'It opens or closes the loop.' },
        { w: 'conductor', d: 'Something electricity can travel through, like metal.' }, { w: 'insulator', d: 'Something electricity cannot travel through, like plastic or rubber.' },
        { w: 'series', d: 'Parts joined one after another in a row.' }, { w: 'parallel', d: 'Parts joined side by side, each on its own path.' }, { w: 'volt', d: 'How strongly a battery pushes. We measure it in volts.' }
      ],
      quiz: [
        { q: 'What does a circuit need to make a light turn on?', opts: ['A complete loop', 'Only a battery', 'A very long wire', 'A big switch'], a: 0, why: 'Electricity needs a complete loop from the battery, through the light, and back.' },
        { q: 'Which of these lets electricity flow through it?', opts: ['A metal paper clip', 'A wooden spoon', 'A rubber eraser', 'A plastic comb'], a: 0, why: 'Metals are conductors. Wood, rubber and plastic are insulators.' },
        { q: 'Which leg of an LED is the + side?', opts: ['The long leg', 'The short leg', 'Both legs', 'Neither leg'], a: 0, why: 'The longer leg is +. An LED only works one way round.' },
        { q: 'Why does an LED need a resistor?', opts: ['To stop too much electricity burning it out', 'To make it a different colour', 'To make it louder', 'It does not need one'], a: 0, why: 'A resistor limits the flow so the LED does not get too hot.' },
        { q: 'Two lights are joined one after the other (in series). You take one out. What happens to the other?', opts: ['It goes out too', 'It gets brighter', 'It stays the same', 'It changes colour'], a: 0, why: 'In series there is only one path. Break it anywhere and everything stops.' },
        { q: 'What happens to a solar panel if you cover it with your hand?', opts: ['It makes less electricity', 'It makes more electricity', 'It makes music', 'Nothing changes'], a: 0, why: 'Solar panels turn light into electricity, so less light means less power.' },
        { q: 'Should we ever join the + and - of a battery with just a wire?', opts: ['No! It gets hot and is unsafe', 'Yes, it makes a super light', 'Only on Fridays', 'Yes, if it is a small battery'], a: 0, why: 'That is the Red-Line Rule. The wire and the battery heat up quickly.' },
        { q: 'Which of these is an insulator?', opts: ['A rubber band', 'A coin', 'A paper clip', 'A spoon made of steel'], a: 0, why: 'Rubber does not let electricity through.' }
      ],
      badge: { name: 'Light Keeper', emoji: '🏮', how: 'Finish every lab and pass the quiz.', earned: 'You can build a working circuit and explain why it needs a loop!' }
    },

    /* ===================== QUEST 2 ===================== */
    {
      id: 2, title: 'Gates & Switches', emoji: '🚪', color: '#2D6BE4', tagline: 'Logic, truth tables and binary',
      bigQuestion: 'Can a machine make a decision?',
      answer: 'Yes. A decision is a rule about yes/no inputs, and AND, OR and NOT can build any decision.',
      story: 'The Castle of Choices has three doors guarded by gates. Each gate has a rule. Learn the rules and you can walk right in!',
      labs: ['humangate', 'switchgates', 'binary'],
      sessions: [
        { title: 'Yes, no, 1, 0', kid: 'Play the Human Gates game! One person is a NOT gate and always does the opposite. Then try an AND gate: the door opens only if BOTH friends raise a hand.',
          parent: 'Introduce on/off as 1/0 with red and green cards. Human NOT gate: one girl always does the opposite of the input girl (hand up, hand down). Human AND gate: the door opens only if both input girls raise a hand. Human OR gate: the door opens if either does.',
          parts: ['Red and green cards', 'Friends'], sprout: '"Opposite day": a puppet does the opposite of whatever she does.' },
        { title: 'Truth tables', kid: 'Write every way two switches can be on or off: 00, 01, 10, 11. Fill in what the AND gate and the OR gate do for each.',
          parent: 'Write all four combinations of two inputs on a big chart. Fill in AND and OR from the Human Gate games. Younger girls use coloured cards instead of numbers.',
          parts: ['Big paper', 'Markers', 'Cards'], sprout: 'Sort toys through hoops: "red AND round".' },
        { title: 'Real switches make real gates', kid: 'Wire two buttons and an LED two ways. One after another is AND. Side by side is OR. Test every row!',
          parent: 'Two push buttons and an LED. Buttons one after another (series) give AND. Buttons side by side (parallel) give OR. Girls prove it by testing every row of the truth table.',
          parts: ['2 push buttons', 'LED', '330 Ω resistor', '3 x AA holder'], sprout: 'Press a big button to light the toy lamp.' },
        { title: 'The missing gate', kid: 'Can you make a light that is ON when the button is NOT pressed, using only wires and a normal switch? Think about it… we need something new!',
          parent: 'Challenge: a light that is ON when the button is NOT pressed, using only wires and ordinary switches. A normal button cannot flip its answer. (A normally-closed button can, but the flipping is built into the button.) End with "What could do the flipping for us?" That leads to transistors.',
          parts: ['Same parts as before'], sprout: 'Opposite Owl toy.' },
        { title: 'Counting in binary', kid: 'Count from 0 to 7 using only lights that are ON or OFF. Light 1, light 2, light 4: what number can you make?',
          parent: 'With three LEDs or three cards, count 0 to 7 using on/off. Younger girls count their "on" fingers. Older girls connect it to place values 1, 2, 4. This is exactly how the Arduino and every computer count.',
          parts: ['3 LEDs or cards', 'Paper'], sprout: 'Count the lights by tapping each one.' }
      ],
      vocab: [
        { w: 'logic', d: 'Rules for making a decision from yes and no answers.' }, { w: 'input', d: 'Something that goes into a gate.' }, { w: 'output', d: 'What comes out of a gate: the answer.' },
        { w: 'AND', d: 'Yes only if both inputs are yes.' }, { w: 'OR', d: 'Yes if at least one input is yes.' }, { w: 'NOT', d: 'Flips the answer: yes becomes no, no becomes yes.' },
        { w: 'truth table', d: 'A chart showing the output for every possible input.' }, { w: 'binary', d: 'Counting with only 0s and 1s.' }
      ],
      quiz: [
        { q: 'An AND gate gives 1 when…', opts: ['both inputs are 1', 'either input is 1', 'both inputs are 0', 'the input is 0'], a: 0, why: 'AND needs both. That is why it is like two keys for one door.' },
        { q: 'An OR gate gives 1 when…', opts: ['at least one input is 1', 'both inputs are 0', 'only one input is 1, never two', 'it is raining'], a: 0, why: 'OR is happy with either one, or both.' },
        { q: 'What is NOT 1?', opts: ['0', '1', '2', 'It depends'], a: 0, why: 'NOT flips the answer.' },
        { q: 'Two buttons wired one after the other (in series) make which gate?', opts: ['AND', 'OR', 'NOT', 'XOR'], a: 0, why: 'Both buttons must be pressed for electricity to get through.' },
        { q: 'Two buttons wired side by side (in parallel) make which gate?', opts: ['OR', 'AND', 'NOT', 'NAND'], a: 0, why: 'Either path lets electricity through.' },
        { q: 'In binary, what number is 101?', opts: ['5', '3', '7', '101'], a: 0, why: '4 + 0 + 1 = 5.' },
        { q: 'How many different input combinations does a 2-input gate have?', opts: ['4', '2', '3', '8'], a: 0, why: '00, 01, 10 and 11.' },
        { q: 'Why can plain switches not make a NOT gate?', opts: ['A switch can only let electricity through, not flip the answer', 'Switches are too small', 'NOT is not a real gate', 'Switches only work in the dark'], a: 0, why: 'We need a part that can turn the output OFF when the input is ON. That is a transistor!' }
      ],
      badge: { name: 'Gate Keeper', emoji: '🚪', how: 'Finish every lab and pass the quiz.', earned: 'You know how AND, OR and NOT make decisions!' }
    },

    /* ===================== QUEST 3 ===================== */
    {
      id: 3, title: 'Meet the Transistor', emoji: '🔀', color: '#9B6BE4', tagline: 'A switch with no moving parts',
      bigQuestion: 'What if a tiny electric signal could flip a switch for us?',
      answer: 'A transistor is a switch with no moving parts. A small current into one leg controls a much bigger current.',
      story: 'In the Workshop of Wonders there is a tiny three-legged creature called a transistor. It is the secret behind every computer, phone and robot. Time to meet it!',
      labs: ['pinout', 'tap', 'nightlight'],
      sessions: [
        { title: 'Meet the transistor', kid: 'Look at your transistors. Each one has three legs: Base, Collector and Emitter. Find out which leg is which.',
          parent: 'Sort the transistors you have and read the number printed on each (BC547, 2N3904, 2N2222…). The legs are the base (B), collector (C) and emitter (E). CHECK THE PINOUT FOR EACH TYPE: with the flat face toward you, a BC547 reads C-B-E left to right, while a 2N3904 reads E-B-C. Use a multimeter diode mode or the datasheet if unsure. Draw the symbol in the notebook.',
          parts: ['Transistors', 'Multimeter', 'Datasheet'], sprout: 'The "tap" game: a trickle of water turns a big waterwheel.' },
        { title: 'Build the switch', kid: 'Press a button to send a tiny signal to the base. The LED lights! Let go and it goes out. A small signal controls a big one.',
          parent: 'LED and a 330 Ω resistor from battery + to the collector; emitter to battery -. Connect the base through a 10k resistor to a push button, and the button to battery +. Press: LED lights.',
          parts: ['NPN transistor', '10 kΩ resistor', '330 Ω resistor', 'LED', 'push button', '3 x AA'], sprout: 'Press the big button and shout "it works!"' },
        { title: 'Touch sensor', kid: 'Replace the button with two bare wires and touch both with your finger. Your skin lets a tiny bit of electricity through. Add a second transistor to make it brighter!',
          parent: 'Replace the push button with two bare wires and a finger across both. With 4.5 V a single transistor may light the LED dimly. Add a second transistor in a Darlington pair (first emitter into second base) to light it brightly.',
          parts: ['2 transistors', '10 kΩ resistor', 'bare wires'], sprout: 'Finger-painting with a (safe) touch lamp.' },
        { title: 'Light sensor', kid: 'Make a night light that turns on all by itself when it gets dark!',
          parent: 'Photoresistor (LDR) and a 10k resistor in a chain across the battery, base connected between them. With the LDR on the battery - side and the 10k on the + side, the LED turns on in the dark. Swap them to reverse.',
          parts: ['Photoresistor (LDR)', '10 kΩ resistor', 'transistor', 'LED'], sprout: 'Cover and uncover a toy sun-sensor with a hand.' },
        { title: 'The flip', kid: 'Rewire so pressing the button turns the LED OFF. You just made a NOT gate!',
          parent: 'Rewire so pressing the button turns the LED OFF: the LED and a resistor to + sit at the collector, and the transistor, when on, pulls the output down to 0. The output is the opposite of the input: a NOT gate, the missing piece from Quest 2.',
          parts: ['Same parts'], sprout: 'Opposite Owl toy.' }
      ],
      vocab: [
        { w: 'transistor', d: 'A tiny switch with no moving parts, controlled by electricity.' }, { w: 'base', d: 'The leg where the small signal goes in.' },
        { w: 'collector', d: 'The leg where the big current comes in.' }, { w: 'emitter', d: 'The leg where the current leaves.' },
        { w: 'amplify', d: 'Make a small signal into a bigger one.' }, { w: 'sensor', d: 'A part that notices the world, like light or touch.' }, { w: 'Darlington pair', d: 'Two transistors working together for extra boost.' }
      ],
      quiz: [
        { q: 'What are the three legs of a transistor called?', opts: ['Base, Collector, Emitter', 'Top, Middle, Bottom', 'Red, Green, Blue', 'Input, Output, Power'], a: 0, why: 'B, C and E.' },
        { q: 'A transistor is like a water tap whose handle is turned by…', opts: ['a tiny trickle of water', 'a big waterfall', 'the wind', 'nothing at all'], a: 0, why: 'A small flow controls a big one.' },
        { q: 'Where does the small control signal go in?', opts: ['The base', 'The collector', 'The emitter', 'The battery'], a: 0, why: 'The base is the boss that controls the switch.' },
        { q: 'Are the legs of every transistor type in the same order?', opts: ['No! Check the datasheet', 'Yes, always', 'Only for red ones', 'Only in Ireland'], a: 0, why: 'A BC547 and a 2N3904 have their legs in opposite orders.' },
        { q: 'What is a Darlington pair?', opts: ['Two transistors working together for more boost', 'A transistor and a battery', 'A pair of LEDs', 'A kind of switch'], a: 0, why: 'The first transistor feeds the second, so a tiny touch can light an LED.' },
        { q: 'In our NOT circuit, what happens to the LED when you press the button?', opts: ['It goes OFF', 'It goes ON', 'It gets louder', 'Nothing'], a: 0, why: 'NOT flips the answer.' },
        { q: 'Why do we put a resistor on the base?', opts: ['To limit the current going in', 'To make it shiny', 'To change its colour', 'We do not need one'], a: 0, why: 'Too much current into the base can damage the transistor.' },
        { q: 'In our night light, the LED turns on when it is…', opts: ['dark', 'bright', 'hot', 'cold'], a: 0, why: 'In the dark the light sensor has high resistance, pushing the base voltage up.' }
      ],
      badge: { name: 'Transistor Tamer', emoji: '🔀', how: 'Finish every lab and pass the quiz.', earned: 'You can explain how a small signal controls a big one!' }
    },

    /* ===================== QUEST 4 ===================== */
    {
      id: 4, title: 'Build the Gates', emoji: '🧩', color: '#0FBF94', tagline: 'NOT, NOR and NAND from transistors',
      bigQuestion: 'Can we build AND, OR and NOT out of transistors?',
      answer: 'Yes. And two of them, NAND and NOR, can build all the others. That is why every computer is made of them.',
      story: 'The Gatesmith needs help! Build NOT, NOR and NAND from transistors and chain them into new gates.',
      labs: ['gatelab', 'buildgate', 'rulemachine'],
      sessions: [
        { title: 'The NOT gate', kid: 'Rebuild your NOT circuit as a neat little gate board. Input 1 makes output 0. Input 0 makes output 1.',
          parent: 'Shared setup: 5 V from the Arduino 5 V pin or 3 x AA. Each transistor gets a 10k resistor on its base. Each gate has a 1k pull-up from + to its output. An LED with a 1k resistor from output to - shows the answer (a little dim is normal). Inputs are wires touched to + (1) or - (0). Fill in the two-row truth table.',
          parts: ['Transistor', '10 kΩ', '1 kΩ x2', 'LED'], sprout: 'Sort toys through gates: "red AND round".' },
        { title: 'The NOR gate', kid: 'Put two transistors side by side, both pulling the output down. When is the light on?',
          parent: 'Two transistors side by side, both pulling the output down. The output is 1 only when both inputs are 0. Test all four combinations: 00 gives 1, the other three give 0.',
          parts: ['2 transistors', '2 x 10 kΩ', '1 kΩ', 'LED'], sprout: 'Count the lights that are on.' },
        { title: 'The NAND gate', kid: 'Now put the two transistors one above the other. Both must be on to pull the output down. Compare with AND: it is the opposite!',
          parent: 'Two transistors stacked: collector of the top at the output, bottom emitter to -. Both must be on to pull the output down. Truth table: three rows give 1, and 11 gives 0.',
          parts: ['2 transistors', '2 x 10 kΩ', '1 kΩ', 'LED'], sprout: 'Door toy: needs BOTH.' },
        { title: 'Chain them!', kid: 'Feed a NAND into a NOT to get AND. Feed a NOR into a NOT to get OR. Then wire both NAND inputs together: it becomes a NOT!',
          parent: 'NAND into NOT gives AND. NOR into NOT gives OR. Wire both inputs of a NAND together and you have a NOT. Gates can be built from each other: NAND and NOR are "universal".',
          parts: ['Gate boards from earlier'], sprout: 'Opposite Owl.' },
        { title: 'Decision box', kid: 'Make a silly rule with three switches, like "the lunch bell rings if it is pasta AND NOT broccoli". Test all eight combinations!',
          parent: 'Give each girl a silly rule to build with three switches and the gates she has made, e.g. "the lunch bell rings if pasta AND NOT broccoli". Test all eight combinations.',
          parts: ['3 switches', 'Gate boards', 'Buzzer or LED'], sprout: 'Door toy.' }
      ],
      vocab: [
        { w: 'gate', d: 'A tiny circuit that follows a logic rule.' }, { w: 'inverter', d: 'Another name for a NOT gate.' }, { w: 'NAND', d: 'NOT AND: gives 0 only when both inputs are 1.' },
        { w: 'NOR', d: 'NOT OR: gives 1 only when both inputs are 0.' }, { w: 'universal gate', d: 'A gate you can build every other gate from.' }, { w: 'pull-up', d: 'A resistor that pulls the output up to 1 when nothing pulls it down.' }
      ],
      quiz: [
        { q: 'A NAND gate gives 0 only when…', opts: ['both inputs are 1', 'both inputs are 0', 'either input is 1', 'never'], a: 0, why: 'NAND is NOT-AND: the opposite of AND.' },
        { q: 'A NOR gate gives 1 only when…', opts: ['both inputs are 0', 'both inputs are 1', 'either input is 1', 'always'], a: 0, why: 'NOR is NOT-OR: the opposite of OR.' },
        { q: 'Two transistors one above the other (in series) make which gate?', opts: ['NAND', 'NOR', 'NOT', 'OR'], a: 0, why: 'Both must be on to pull the output down.' },
        { q: 'Two transistors side by side (in parallel) make which gate?', opts: ['NOR', 'NAND', 'AND', 'XOR'], a: 0, why: 'Either one can pull the output down.' },
        { q: 'NAND followed by NOT makes…', opts: ['AND', 'OR', 'NOR', 'XOR'], a: 0, why: 'Flipping the opposite of AND gives AND.' },
        { q: 'If you wire both inputs of a NAND together, you get a…', opts: ['NOT gate', 'AND gate', 'OR gate', 'Battery'], a: 0, why: 'Both inputs are always the same, so it just flips.' },
        { q: 'Why are NAND and NOR called universal?', opts: ['You can build every other gate from them', 'They are the biggest gates', 'They are shiny', 'They work anywhere in the universe'], a: 0, why: 'This is why a computer chip can be made from just one gate type.' },
        { q: 'What does the pull-up resistor do?', opts: ['Pulls the output up to 1 when nothing pulls it down', 'Makes the LED blink', 'Turns the gate off', 'Cleans the wires'], a: 0, why: 'It sets the default output to 1.' }
      ],
      badge: { name: 'Gate Builder', emoji: '🧩', how: 'Finish every lab and pass the quiz.', earned: 'You built and tested NOT, NOR and NAND gates!' }
    },

    /* ===================== QUEST 5 ===================== */
    {
      id: 5, title: 'The Memory Maker', emoji: '🧠', color: '#E8604C', tagline: 'Latches that remember',
      bigQuestion: 'How can a machine remember something after the button is let go?',
      answer: 'Two gates that listen to each other form a loop that holds one bit until someone changes it.',
      story: 'The Memory Maker has a magic trick: she remembers! Learn her secret and make a circuit that remembers a single bit.',
      labs: ['latchlab', 'humanlatch', 'tripwire', 'firstbuzz'],
      sessions: [
        { title: 'The flip-flop', kid: 'Build two transistors that hold each other in place. Press a button and one LED stays on, even after you let go!',
          parent: 'Two transistors Q1 and Q2, each with a 1k resistor from + to its collector. Connect each collector through a 10k resistor to the OTHER transistor\'s base. Put an LED with a 1k resistor from each collector to -. Add a push button for each transistor, wired from its base to -. Press button 1: one LED lights and stays lit after release. Press button 2: the other lights.',
          parts: ['2 transistors', '2 x 1 kΩ', '2 x 10 kΩ', '2 LEDs + 1 kΩ', '2 push buttons'], sprout: 'The Statue Game: freeze when you hear "set", move on "reset".' },
        { title: 'The SR latch', kid: 'Draw two NOR gates feeding each other. Set makes it 1. Reset makes it 0. Play Human Latch!',
          parent: 'Two NOR gates, each one\'s output feeding the other\'s input. Inputs Set (S) and Reset (R). S=1 sets Q to 1, R=1 resets to 0, both off HOLDS, both on is not allowed. Human Latch: one girl holds a card and changes it only when told Set or Reset. Build from the Quest 4 NOR gates (Makers/Engineers).',
          parts: ['NOR gate boards'], sprout: 'Statue Game.' },
        { title: 'Use the memory', kid: 'Build a tripwire alarm that keeps ringing even after the trigger stops. Only the Reset button silences it!',
          parent: 'A light sensor or switch is the trigger that sets the latch; the buzzer stays on after the trigger stops; only Reset silences it. Compare with a normal switch, which forgets instantly. Option: a two-player "who pressed first?" game where each button locks out the other.',
          parts: ['Latch board', 'Buzzer', 'Switch or LDR'], sprout: 'Door toy.' },
        { title: 'How much memory?', kid: 'One latch holds one bit. Eight latches hold a byte. How many bits are in a phone?',
          parent: 'One latch holds one bit. Eight hold a byte (one letter). A 128 GB phone holds about a trillion bits. A notebook page and a short talk, "how my computer remembers", finish the quest.',
          parts: ['Notebook'], sprout: 'Count to eight with the lights.' }
      ],
      vocab: [
        { w: 'memory', d: 'Something that holds on to information.' }, { w: 'latch', d: 'A circuit that remembers one bit.' }, { w: 'flip-flop', d: 'A memory circuit that flips between two states.' },
        { w: 'set', d: 'Make the memory 1.' }, { w: 'reset', d: 'Make the memory 0.' }, { w: 'bit', d: 'One 0 or 1.' }, { w: 'byte', d: 'Eight bits.' }, { w: 'feedback', d: 'When a circuit\'s output goes back into its own input.' }
      ],
      quiz: [
        { q: 'How much does one latch remember?', opts: ['One bit', 'One byte', 'One page', 'A whole song'], a: 0, why: 'A latch holds one 0 or 1.' },
        { q: 'You press Set on an SR latch. What does Q become?', opts: ['1', '0', 'It breaks', 'It is random'], a: 0, why: 'Set means make the memory 1.' },
        { q: 'Set and Reset are both off. What does the latch do?', opts: ['Holds its memory', 'Forgets everything', 'Turns off', 'Counts'], a: 0, why: 'That is the memory trick: it keeps its last answer.' },
        { q: 'Why must we never press Set and Reset together on a NOR latch?', opts: ['Both outputs go to 0 and the answer is unclear when you let go', 'It makes a loud noise', 'It breaks the battery', 'It is allowed'], a: 0, why: 'After releasing, the latch could land on either state.' },
        { q: 'How many bits are in a byte?', opts: ['8', '2', '10', '16'], a: 0, why: 'A byte is eight bits.' },
        { q: 'A tripwire alarm uses a latch so that…', opts: ['the alarm keeps ringing after the trigger stops', 'it rings quieter', 'it never rings', 'it only works in daylight'], a: 0, why: 'The latch remembers that the wire was tripped.' },
        { q: 'What is different about a normal switch compared with a latch?', opts: ['A normal switch forgets the moment you let go', 'A switch is brighter', 'A latch is heavier', 'Nothing'], a: 0, why: 'The latch remembers by feeding its output back to its input.' },
        { q: 'What does "feedback" mean here?', opts: ['The output goes back into the input', 'Your teacher gives you a grade', 'The wires are loud', 'Using two batteries'], a: 0, why: 'Two gates listening to each other make the loop that holds the bit.' }
      ],
      badge: { name: 'Memory Maker', emoji: '🧠', how: 'Finish every lab and pass the quiz.', earned: 'You built a circuit that remembers!' }
    },

    /* ===================== QUEST 6 ===================== */
    {
      id: 6, title: 'Chip Safari', emoji: '🔬', color: '#D6428C', tagline: 'Real chips, timers and counters',
      bigQuestion: 'How do people fit thousands of gates in something the size of a fingernail?',
      answer: 'A chip is gates and latches just like yours, shrunk down and packaged in a black rectangle with legs.',
      story: 'Welcome to the Chip Jungle! The creatures here have lots of legs and live in black rectangles. Each one is hiding a whole village of gates.',
      labs: ['chipsafari', 'dff', 'timer555', 'halfadder'],
      sessions: [
        { title: 'The black box', kid: 'Open the box of chips and play detective. Read the numbers, find the notch, count the legs. A 74HC04 has six NOT gates inside!',
          parent: 'Chip rules (say aloud each session): power off before plugging in; notch to the left and pins straddle the gap; check the pinout on the datasheet; every input is tied to + or - or driven by something (unused inputs to -); touch grounded metal first for static. 14-pin gate chips take +5 V on pin 14 and ground on pin 7. Wire a 74HC04, test one gate. Check each gate on a 74HC02 (NOR) and 74HC00 (NAND) against the Quest 4 truth tables.',
          parts: ['74HC04', '74HC00', '74HC02', 'breadboard', 'LEDs'], sprout: 'Chip petting zoo: look at a real chip through a magnifying glass.' },
        { title: 'The chip latch', kid: 'Rebuild the SR latch with two of the four NOR gates on a 74HC02. Same behaviour, much tidier!',
          parent: 'SR latch on a 74HC02: gate 1 output pin 1, inputs pins 2 and 3; gate 2 output pin 4, inputs pins 5 and 6. Wire pin 1 to pin 6 and pin 4 to pin 3. Reset on pin 2, Set on pin 5. Buttons with 10k resistors to - so inputs never float. LEDs with 330 Ω on pins 1 and 4. Check the datasheet: the NOR chip has outputs on different pins from the NAND chip.',
          parts: ['74HC02', '2 push buttons', '2 x 10 kΩ', '2 LEDs', '2 x 330 Ω'], sprout: 'Statue Game.' },
        { title: 'The D flip-flop', kid: 'The 74HC74 remembers a bit but only listens when you press the clock button. Eight of these make a byte!',
          parent: '74HC74: tie preset and clear pins to + (they are active-low), set D with a switch, press a clock button, watch Q copy D. Change D while the clock is idle and nothing happens. It is a latch with a gate that opens only on the clock\'s click.',
          parts: ['74HC74', 'switch', 'push button', 'LED'], sprout: 'Press the clock button together.' },
        { title: 'Blinking and counting', kid: 'Build a blinker with a 555 timer. Then feed it into a counter chip to make a chasing light!',
          parent: '555 astable: 1k, 47k and 10 µF give about 1.5 flashes per second. Feed the output into a 74HC4017 (clock pin 14, reset 15 and clock-enable 13 to -). The ten outputs light LEDs one by one, a chaser. Use a CMOS 555 (TLC555/LMC555), or drive the counter from the Arduino blink program.',
          parts: ['555 timer', '74HC4017', 'capacitor', 'resistors', '10 LEDs'], sprout: 'Watch the chaser lights and clap along.' },
        { title: 'Adding machine', kid: 'Make a half adder from NAND gates: two switches add two one-bit numbers. 1 + 1 = 10 in binary!',
          parent: 'Half adder from NAND gates: the sum is XOR (four NANDs), the carry reuses the first NAND followed by a NOT-wired NAND. Five gates total, so two 74HC00 chips. 0+0=00, 0+1=01, 1+0=01, 1+1=10. Younger girls predict, then press the switches.',
          parts: ['2 x 74HC00', '2 switches', '2 LEDs'], sprout: 'Count fingers: 1 and 1 make 2.' }
      ],
      vocab: [
        { w: 'chip', d: 'A tiny circuit packed in a black package with legs.' }, { w: 'integrated circuit', d: 'The proper name for a chip.' }, { w: 'datasheet', d: 'The instruction page for a chip.' },
        { w: 'pin', d: 'One of the metal legs on a chip.' }, { w: 'notch', d: 'The little dent that shows which end is pin 1.' }, { w: 'clock', d: 'A regular tick that tells a chip when to listen.' },
        { w: 'flip-flop', d: 'A memory that changes only on the clock tick.' }, { w: 'counter', d: 'A chip that counts clock ticks.' }, { w: 'floating input', d: 'An input connected to nothing. It gives random answers!' }, { w: 'half adder', d: 'A circuit that adds two one-bit numbers.' }
      ],
      quiz: [
        { q: 'A 74HC04 chip contains…', opts: ['Six NOT gates', 'One big battery', 'Eight batteries', 'A tiny computer'], a: 0, why: 'The 04 is a "hex inverter": six NOT gates.' },
        { q: 'On a 14-pin 74HC chip, which pins are power and ground?', opts: ['Pin 14 = +5 V, pin 7 = ground', 'Pin 1 = +5 V, pin 14 = ground', 'Pin 7 = +5 V, pin 14 = ground', 'Any two pins'], a: 0, why: 'The top corner pin is power and the opposite corner is ground.' },
        { q: 'What is a floating input?', opts: ['An input connected to nothing, giving random answers', 'An input that is underwater', 'An input that is on', 'A very fast input'], a: 0, why: 'Always tie unused inputs to + or -.' },
        { q: 'A D flip-flop copies D to Q…', opts: ['when the clock ticks', 'all the time', 'never', 'only at night'], a: 0, why: 'It only listens at the clock\'s click.' },
        { q: 'What is a 555 timer often used for?', opts: ['Making a regular blink', 'Adding numbers', 'Storing photos', 'Measuring weight'], a: 0, why: 'Resistors and a capacitor set how fast it blinks.' },
        { q: 'A 4017 decade counter…', opts: ['Lights one of ten outputs at a time as it counts', 'Counts to a million', 'Adds two numbers', 'Plays music'], a: 0, why: 'That is how a chaser light works.' },
        { q: 'In binary, 1 + 1 equals…', opts: ['10', '2', '11', '0'], a: 0, why: 'There is no digit 2 in binary, so it carries over: 10 (which means two).' },
        { q: 'What is the notch on a chip for?', opts: ['It shows which end is pin 1', 'It is for hanging it up', 'It is a button', 'It is decoration'], a: 0, why: 'Pins count anti-clockwise from the notch.' }
      ],
      badge: { name: 'Chip Whisperer', emoji: '🔬', how: 'Finish every lab and pass the quiz.', earned: 'You can use real chips and explain what they do!' }
    },

    /* ===================== QUEST 7 ===================== */
    {
      id: 7, title: 'Code & Sonar', emoji: '🦇', color: '#1D9CC4', tagline: 'Arduino, code and echo location',
      bigQuestion: 'How do we tell a tiny computer what to do, and how can it "see" with sound?',
      answer: 'A program is a list of instructions, and AND, OR and NOT return as lines of code. A sonar sensor measures distance by timing an echo.',
      story: 'Captain Bat needs a parking sensor for her submarine! Write instructions for the Arduino and teach it to listen for echoes.',
      labs: ['sonar', 'parking', 'codedetective'],
      sessions: [
        { title: 'Hello, blink', kid: 'Plug in the Arduino and run Blink. Change the numbers and see what happens!',
          parent: 'Plug in the Uno, open the built-in Blink example, run it. Change the delay numbers and re-upload; everyone gets to change one number. A program is a recipe the Arduino follows in order. Tinkercad Circuits is a free browser option to rehearse builds.',
          parts: ['Arduino Uno', 'USB cable', 'Laptop'], sprout: 'Clap on and off in time with the blink.' },
        { title: 'Logic in code', kid: 'Wire two buttons and an LED. Write if (a && b) for AND, if (a || b) for OR, and if (!a) for NOT. The gates are now software!',
          parent: 'Two buttons (INPUT_PULLUP, so each reads LOW when pressed) and an LED on pin 8. if (a && b) = AND, if (a || b) = OR, if (!a) = NOT. Test each against the truth tables on the wall.',
          parts: ['2 push buttons', 'LED + 330 Ω'], sprout: 'Door toy.' },
        { title: 'Counting in binary', kid: 'Three LEDs count from 0 to 7. Add a button so each press adds one.',
          parent: 'Three LEDs on pins 8, 9 and 10 count 0 to 7 using the Quest 2 binary idea. Add a button so each press adds one. Older girls add a fourth LED.',
          parts: ['3 or 4 LEDs', '330 Ω resistors', 'button'], sprout: 'Count the lights.' },
        { title: 'Sonar', kid: 'Bats and dolphins use sound to find things. Wire the sonar sensor and watch the numbers change as you move your hand.',
          parent: 'Wire VCC to 5 V, GND to GND, Trig to pin 9, Echo to pin 10. Sound travels about 343 m/s; the HC-SR04 sends a ping and times the echo; distance = time x speed ÷ 2 (there and back). Use the Serial Monitor to watch the number change.',
          parts: ['HC-SR04', 'Arduino', 'jumper wires'], sprout: 'Echo game in a big room or stairwell.' },
        { title: 'Parking sensor', kid: 'Add an LED and a buzzer. The closer something is, the faster it beeps. Park a toy car!',
          parent: 'Add an LED and a buzzer. The closer the object, the faster it beeps. Girls choose distance steps and beep speeds, then test by parking a toy car at the wall.',
          parts: ['HC-SR04', 'Buzzer', 'LED'], sprout: 'Bat Echo toy.' },
        { title: 'Arduino meets chips', kid: 'Make the Arduino talk to your latch chip: when the sonar sees something close, it sets the latch. A remembering intruder alarm!',
          parent: 'The Arduino drives the Set and Reset inputs of the 74HC02 latch and reads its output. The sonar sets the latch when something comes close; a button resets it. It uses everything in the course.',
          parts: ['Arduino', '74HC02 latch', 'HC-SR04', 'buzzer'], sprout: 'Statue Game.' }
      ],
      vocab: [
        { w: 'program', d: 'A list of instructions for a computer.' }, { w: 'code', d: 'The words we write in a program.' }, { w: 'upload', d: 'Send your program to the Arduino.' }, { w: 'pin', d: 'A connection on the Arduino.' },
        { w: 'sensor', d: 'A part that notices the world.' }, { w: 'echo', d: 'Sound that bounces back.' }, { w: 'sonar', d: 'Finding things with sound echoes.' }, { w: 'serial monitor', d: 'A window that shows what the Arduino says.' }, { w: 'loop', d: 'Something that repeats again and again.' }
      ],
      quiz: [
        { q: 'About how fast does sound travel in air?', opts: ['343 metres per second', '3 metres per second', '3,000,000 metres per second', 'It stops at walls'], a: 0, why: 'About 343 m/s, so an echo from 1 metre away returns in under 6 thousandths of a second.' },
        { q: 'Why do we divide by 2 when working out sonar distance?', opts: ['The sound goes there AND back', 'Because we only have two ears', 'It makes the number smaller', 'We forgot to'], a: 0, why: 'The time we measure is for the trip to the object and back.' },
        { q: 'Which pin of the sonar sends the ping?', opts: ['Trig', 'Echo', 'VCC', 'GND'], a: 0, why: 'Trig triggers the ping. Echo listens for it.' },
        { q: 'In code, what does && mean?', opts: ['AND', 'OR', 'NOT', 'MAYBE'], a: 0, why: '&& is AND, || is OR and ! is NOT.' },
        { q: 'What does it mean when pulseIn gives back 0?', opts: ['No echo was heard', 'The distance is zero', 'The Arduino is broken', 'The sound was too loud'], a: 0, why: 'It timed out waiting for an echo.' },
        { q: 'What does delay(500) do?', opts: ['Waits half a second', 'Waits 500 seconds', 'Adds 500', 'Turns the LED on'], a: 0, why: 'The number is in milliseconds. 1000 is one second.' },
        { q: 'Which animals use echolocation?', opts: ['Bats and dolphins', 'Cows and sheep', 'Fish only', 'Snakes only'], a: 0, why: 'They make sounds and listen for the echoes.' },
        { q: 'What does the loop() part of an Arduino program do?', opts: ['Repeats again and again', 'Runs only once', 'Turns the Arduino off', 'Nothing'], a: 0, why: 'setup() runs once, then loop() repeats forever.' }
      ],
      badge: { name: 'Code Captain', emoji: '🦇', how: 'Finish every lab and pass the quiz.', earned: 'You can read an input and control an output with code!' }
    }
  ];

  /* Capstone ideas, grouped by age band (parent area). */
  EA.CAPSTONES = [
    { band: 'Sparks (4–6)', idea: 'A decorated night-light creature with a switch, or a solar-powered spinning toy. Explain how it works in two sentences.' },
    { band: 'Makers (7–8)', idea: 'A quiz-show buzzer with a latch so the first player to press wins, with a lamp for each player. Or a tripwire alarm for a doll\'s house.' },
    { band: 'Engineers (9–10)', idea: 'The half adder with labelled switches and LEDs as a 1-bit calculator, or the Arduino sonar alarm with a latch and a reset button. Add a written explanation and a diagram.' },
    { band: 'Everyone (Sprouts too!)', idea: 'A family doorbell or "Do not disturb" sign for the schoolroom, built as a team and mounted on the wall.' }
  ];

  /* Safety rules (parent area). */
  EA.SAFETY = [
    ['No coin or button cells (CR2032 and similar) anywhere in the kit.', 'Swallowed, they cause severe internal burns within hours. Use AA/AAA holders with a lid, or USB power from the laptop.'],
    ['No mains electricity, ever.', 'Nothing in this course plugs into a wall socket except a USB charger feeding the laptop.'],
    ['No lithium or LiPo batteries, and no loose magnets.', 'Small neodymium magnets are a swallowing hazard too.'],
    ['Never join a battery\'s + and - with just a wire.', 'The wire and battery get hot fast. This is the first "red-line rule".'],
    ['Every LED gets a resistor.', 'Without one it burns out, and a hot LED is a lesson learned the hard way.'],
    ['Adults do any cutting, stripping or soldering.', 'Nothing here needs soldering. Catch clipped lead ends (they fly).'],
    ['Count the parts out and count them in.', 'Use a lidded tray or muffin tin each session. Small components stay up high when the little ones are around.'],
    ['Power off before changing anything.', 'Say it aloud every time: "Power off before I change anything."']
  ];

  /* Parts list (parent area). `have` = already owned. */
  EA.PARTS = [
    { id: 'uno', unit: '7', name: 'Arduino Uno + USB cable', qty: '1', cost: '', have: true },
    { id: 'bread', unit: 'all', name: 'Breadboards (400 point is plenty)', qty: '1 owned, +3', cost: '10 EUR', have: false },
    { id: 'jump', unit: 'all', name: 'Jumper wires', qty: 'plenty', cost: '', have: true },
    { id: 'solar', unit: '1', name: 'Small solar panels', qty: '1+', cost: '', have: true },
    { id: 'sonar', unit: '7', name: 'HC-SR04 sonar sensor', qty: '1', cost: '', have: true },
    { id: 'trans0', unit: '3', name: 'A few transistors (sort and test them!)', qty: 'few', cost: '', have: true },
    { id: 'batt', unit: '1', name: '3 x AA battery holder with switch + AA batteries', qty: '2 holders', cost: 'under 10 EUR', have: false },
    { id: 'led', unit: '1', name: 'LEDs (red, green, yellow, 5 mm)', qty: '30', cost: '5 EUR', have: false },
    { id: 'res', unit: '1', name: 'Resistor assortment (220, 330, 1k, 10k, 100k ohm)', qty: '1 kit', cost: '8–12 EUR', have: false },
    { id: 'motor', unit: '1', name: 'Small DC motor or fan, alligator clip leads', qty: '1 + 10', cost: '10 EUR', have: false },
    { id: 'btn', unit: '2', name: 'Push buttons and slide switches', qty: '10 each', cost: '6 EUR', have: false },
    { id: 'npn', unit: '3', name: 'NPN transistors (BC547, 2N3904 or 2N2222)', qty: '20', cost: '4 EUR', have: false },
    { id: 'ldr', unit: '3', name: 'Photoresistor (LDR) + active buzzer', qty: '2 + 2', cost: '4 EUR', have: false },
    { id: 'gates', unit: '6', name: '74HC04, 74HC00, 74HC02, 74HC08, 74HC32', qty: '2 of each', cost: '6 EUR', have: false },
    { id: 'ff', unit: '6', name: '74HC74 (D flip-flop), 74HC4017 (counter), CMOS 555 (TLC555/LMC555)', qty: '2 of each', cost: '6 EUR', have: false },
    { id: 'caps', unit: '6', name: 'Capacitors 10 µF, 100 µF, 0.1 µF', qty: '5 each', cost: '3 EUR', have: false },
    { id: 'dmm', unit: '7', name: 'Basic multimeter (beeps for continuity)', qty: '1', cost: '10–15 EUR', have: false }
  ];
})();
