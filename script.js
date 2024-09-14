document.getElementById("equationForm").addEventListener("submit", function(event) {
    event.preventDefault();
    
    const equation = document.getElementById("equation").value;
    let decimalPlaces = document.getElementById("decimalPlaces").value;
    
    if (!decimalPlaces || decimalPlaces < 1) {
        decimalPlaces = 24; // Якщо користувач не вказав кількість знаків після коми, встановлюємо 24 за замовчуванням
    }

    const roots = findRoots(equation, parseInt(decimalPlaces));
    document.getElementById("rootsOutput").innerText = roots.join(", ");
});

function roundToDecimalPlaces(value, places) {
    return parseFloat(value.toFixed(places));
}

function parseEquation(equation) {
    equation = equation.replace(/\s+/g, '').toUpperCase();
    equation = equation.replace(/X3/g, 'X^3');
    equation = equation.replace(/X2/g, 'X^2');
    equation = equation.replace(/X(?!\d|\^)/g, 'X^1');
    equation = equation.replace(/(?<![X])(\d*)X\^3/, (match, p1) => (p1 === '' || p1 === '+' ? '1' : p1) + 'X^3');
    equation = equation.replace(/(?<![X])(\d*)X\^2/, (match, p1) => (p1 === '' || p1 === '+' ? '1' : p1) + 'X^2');
    equation = equation.replace(/(?<![X])(\d*)X\^1/, (match, p1) => (p1 === '' || p1 === '+' ? '1' : p1) + 'X^1');

    if (equation.startsWith('+')) {
        equation = equation.substring(1);
    }

    return equation;
}

function solveCubic(a, b, c, d, decimalPlaces) {
    const results = [];
    b /= a;
    c /= a;
    d /= a;

    const p = (3 * c - b * b) / 3;
    const q = (2 * b * b * b - 9 * b * c + 27 * d) / 27;
    const discriminant = q * q / 4 + p * p * p / 27;

    if (discriminant > 0) {
        const u = Math.cbrt(-q / 2 + Math.sqrt(discriminant));
        const v = Math.cbrt(-q / 2 - Math.sqrt(discriminant));
        const root = u + v - b / 3;
        results.push(roundToDecimalPlaces(root, decimalPlaces));
    } else if (discriminant === 0) {
        const u = Math.cbrt(-q / 2);
        results.push(roundToDecimalPlaces(2 * u - b / 3, decimalPlaces));
        results.push(roundToDecimalPlaces(-u - b / 3, decimalPlaces));
    } else {
        const r = Math.sqrt(-p * p * p / 27);
        const phi = Math.acos(-q / (2 * r));
        results.push(roundToDecimalPlaces(2 * Math.cbrt(r) * Math.cos(phi / 3) - b / 3, decimalPlaces));
        results.push(roundToDecimalPlaces(2 * Math.cbrt(r) * Math.cos((phi + 2 * Math.PI) / 3) - b / 3, decimalPlaces));
        results.push(roundToDecimalPlaces(2 * Math.cbrt(r) * Math.cos((phi + 4 * Math.PI) / 3) - b / 3, decimalPlaces));
    }
    return results;
}

function solveQuadratic(a, b, c, decimalPlaces) {
    const discriminant = b * b - 4 * a * c;
    const results = [];
    const realPart = -b / (2 * a);

    if (discriminant > 0) {
        const sqrtD = Math.sqrt(discriminant);
        results.push(roundToDecimalPlaces(realPart + sqrtD / (2 * a), decimalPlaces));
        results.push(roundToDecimalPlaces(realPart - sqrtD / (2 * a), decimalPlaces));
    } else if (discriminant === 0) {
        results.push(roundToDecimalPlaces(realPart, decimalPlaces));
    } else {
        const imaginaryPart = Math.sqrt(-discriminant) / (2 * a);
        results.push(roundToDecimalPlaces(realPart, decimalPlaces) + ' + ' + roundToDecimalPlaces(imaginaryPart, decimalPlaces) + 'i');
        results.push(roundToDecimalPlaces(realPart, decimalPlaces) + ' - ' + roundToDecimalPlaces(imaginaryPart, decimalPlaces) + 'i');
    }
    return results;
}

function solveLinear(b, c, decimalPlaces) {
    return [roundToDecimalPlaces(-c / b, decimalPlaces)];
}

function findRoots(equation, decimalPlaces) {
    const formattedEquation = parseEquation(equation);
    const cubicRegex = /^([+-]?\d*)X\^3([+-]?\d*)X\^2([+-]?\d*)X\^1([+-]?\d+)$/;
    const quadRegex = /^([+-]?\d*)X\^2([+-]?\d*)X\^1([+-]?\d+)$/;
    const linRegex = /^([+-]?\d*)X\^1([+-]?\d+)$/;

    if (cubicRegex.test(formattedEquation)) {
        const matches = formattedEquation.match(cubicRegex);
        const a = parseFloat(matches[1] || '1');
        const b = parseFloat(matches[2] || '0');
        const c = parseFloat(matches[3] || '0');
        const d = parseFloat(matches[4] || '0');
        return solveCubic(a, b, c, d, decimalPlaces);
    } else if (quadRegex.test(formattedEquation)) {
        const matches = formattedEquation.match(quadRegex);
        const a = parseFloat(matches[1] || '1');
        const b = parseFloat(matches[2] || '0');
        const c = parseFloat(matches[3] || '0');
        return solveQuadratic(a, b, c, decimalPlaces);
    } else if (linRegex.test(formattedEquation)) {
        const matches = formattedEquation.match(linRegex);
        const b = parseFloat(matches[1] || '1');
        const c = parseFloat(matches[2] || '0');
        return solveLinear(b, c, decimalPlaces);
    } else {
        return ['Помилка: невірний формат рівняння'];
    }
}
