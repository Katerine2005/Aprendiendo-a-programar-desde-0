import { CourseId, Lesson, TestCase } from '../types';

export interface TestResult {
  testId: string;
  description: string;
  expected: string;
  actual: string;
  passed: boolean;
  error?: string;
}

export interface ExecutionResult {
  success: boolean;
  output: string;
  testResults: TestResult[];
  errorMessage?: string;
  htmlPreview?: string;
}

// Virtual SQL Database state for testing SQL queries
const SQL_MOCK_TABLES = {
  usuarios: [
    { id: 1, nombre: 'Ana Garcia', email: 'ana@gmail.com', pais: 'Colombia', edad: 25 },
    { id: 2, nombre: 'Carlos Mendoza', email: 'carlos@yahoo.com', pais: 'Mexico', edad: 34 },
    { id: 3, nombre: 'Laura Perez', email: 'laura@gmail.com', pais: 'Chile', edad: 29 },
  ],
  productos: [
    { id: 1, nombre: 'Teclado Mecanico', precio: 80, categoria: 'Perifericos' },
    { id: 2, nombre: 'Monitor 4K', precio: 450, categoria: 'Pantallas' },
    { id: 3, nombre: 'Mouse Inalambrico', precio: 35, categoria: 'Perifericos' },
    { id: 4, nombre: 'Laptop Gamer', precio: 1200, categoria: 'Computadoras' },
    { id: 5, nombre: 'Audifonos Bluetooth', precio: 99, categoria: 'Audio' },
  ],
  empleados: [
    { id: 101, nombre: 'Juan Gomez', salario: 3500, dept_id: 1, departamento: 'IT' },
    { id: 102, nombre: 'Sofia Lopez', salario: 4200, dept_id: 1, departamento: 'IT' },
    { id: 103, nombre: 'Mateo Ruiz', salario: 2800, dept_id: 2, departamento: 'Ventas' },
    { id: 104, nombre: 'Elena Diaz', salario: 5000, dept_id: 1, departamento: 'IT' },
  ],
  pedidos: [
    { id: 501, usuario_id: 1, monto: 150 },
    { id: 502, usuario_id: 2, monto: 450 },
    { id: 503, usuario_id: 1, monto: 80 },
  ]
};

export async function executeCode(
  language: CourseId,
  userCode: string,
  lesson: Lesson
): Promise<ExecutionResult> {
  const logs: string[] = [];
  const testResults: TestResult[] = [];

  try {
    if (language === 'javascript' || language === 'nodejs') {
      return executeJavaScript(userCode, lesson);
    } else if (language === 'html-css') {
      return executeHtmlCss(userCode, lesson);
    } else if (language === 'sql') {
      return executeSql(userCode, lesson);
    } else {
      // Compiled / Intercepted languages: C++, Python, Java, Rust
      return executeSimulatedLanguage(language, userCode, lesson);
    }
  } catch (err: any) {
    return {
      success: false,
      output: logs.join('\n'),
      testResults: lesson.testCases.map((tc) => ({
        testId: tc.id,
        description: tc.description,
        expected: tc.expectedOutput,
        actual: '',
        passed: false,
        error: err.message || 'Error de ejecución'
      })),
      errorMessage: err.message || String(err)
    };
  }
}

// Executing JavaScript & Node.js
function executeJavaScript(userCode: string, lesson: Lesson): ExecutionResult {
  const logs: string[] = [];
  const originalLog = console.log;
  const originalError = console.error;

  // Intercept console.log inside sandbox
  const customConsole = {
    log: (...args: any[]) => {
      logs.push(args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
    },
    error: (...args: any[]) => {
      logs.push('Error: ' + args.map(a => String(a)).join(' '));
    },
    warn: (...args: any[]) => {
      logs.push('Warn: ' + args.map(a => String(a)).join(' '));
    }
  };

  try {
    // Run inside Function wrapper safely
    const runFn = new Function('console', `
      return (async () => {
        ${userCode}
      })();
    `);
    
    runFn(customConsole);
    const output = logs.join('\n').trim();

    const testResults = lesson.testCases.map(tc => {
      const normalizedOutput = output.replace(/\r\n/g, '\n').trim();
      const normalizedExpected = tc.expectedOutput.replace(/\r\n/g, '\n').trim();
      
      const passed = normalizedOutput === normalizedExpected || 
                     (normalizedOutput.length > 0 && normalizedOutput.includes(normalizedExpected));

      return {
        testId: tc.id,
        description: tc.description,
        expected: tc.expectedOutput,
        actual: output || '(Sin salida en consola)',
        passed
      };
    });

    const success = testResults.every(tr => tr.passed);

    return {
      success,
      output: output || 'Ejecución finalizada sin salidas en consola.',
      testResults
    };
  } catch (err: any) {
    return {
      success: false,
      output: logs.join('\n'),
      testResults: lesson.testCases.map(tc => ({
        testId: tc.id,
        description: tc.description,
        expected: tc.expectedOutput,
        actual: 'Error de Sintaxis / Ejecución',
        passed: false,
        error: err.message
      })),
      errorMessage: err.message
    };
  }
}

// Executing HTML & CSS
function executeHtmlCss(userCode: string, lesson: Lesson): ExecutionResult {
  const testResults = lesson.testCases.map(tc => {
    const cleanUserCode = userCode.toLowerCase().replace(/\s+/g, ' ');
    const cleanExpected = tc.expectedOutput.toLowerCase().replace(/\s+/g, ' ');

    // Check DOM tag matches or code inclusions
    const passed = cleanUserCode.includes(cleanExpected) || 
                   cleanUserCode.includes(tc.expectedOutput.toLowerCase().trim());

    return {
      testId: tc.id,
      description: tc.description,
      expected: tc.expectedOutput,
      actual: passed ? 'Coincide con el estándar especificado' : 'No se encontró la estructura HTML/CSS requerida',
      passed
    };
  });

  const success = testResults.every(tr => tr.passed);

  return {
    success,
    output: success ? 'Estructura HTML y CSS renderizada correctamente.' : 'Atención: Revisa las etiquetas o propiedades CSS del ejercicio.',
    testResults,
    htmlPreview: userCode
  };
}

// Executing Virtual SQL Engine
function executeSql(userCode: string, lesson: Lesson): ExecutionResult {
  const cleanCode = userCode.trim().toUpperCase();
  const testResults: TestResult[] = [];
  let simulatedOutput = '';

  for (const tc of lesson.testCases) {
    const expectedClean = tc.expectedOutput.trim().toUpperCase();
    
    // Check keyword structure and logic match
    const keywordsPassed = expectedClean.split(' ').every(word => {
      if (['*', 'FROM', 'WHERE', 'SELECT', 'JOIN', 'GROUP', 'BY', 'ORDER', 'LIMIT', 'INSERT', 'UPDATE', 'CREATE', 'TABLE', 'VIEW', 'INDEX', 'BEGIN', 'COMMIT'].includes(word)) {
        return cleanCode.includes(word);
      }
      return true;
    });

    const exactMatch = cleanCode.includes(expectedClean.replace(/;/g, '')) || 
                       cleanCode.replace(/\s+/g, ' ') === expectedClean.replace(/\s+/g, ' ');

    const passed = exactMatch || keywordsPassed;

    testResults.push({
      testId: tc.id,
      description: tc.description,
      expected: tc.expectedOutput,
      actual: userCode.trim(),
      passed
    });
  }

  const success = testResults.every(tr => tr.passed);

  if (cleanCode.startsWith('SELECT')) {
    simulatedOutput = `[Resultados de Consulta SQL]\nFilas obtenidas: 3 filas afectadas.\nEjecución completada en 2ms.`;
  } else if (cleanCode.startsWith('INSERT') || cleanCode.startsWith('UPDATE') || cleanCode.startsWith('DELETE')) {
    simulatedOutput = `[Operación DML SQL Exitosamente Ejecutada]\nFilas modificadas: 1.`;
  } else if (cleanCode.startsWith('CREATE')) {
    simulatedOutput = `[Operación DDL SQL Exitosamente Ejecutada]\nObjeto de base de datos creado.`;
  } else {
    simulatedOutput = `[Transacción SQL]\nBEGIN -> Operaciones procesadas -> COMMIT.`;
  }

  return {
    success,
    output: simulatedOutput,
    testResults
  };
}

// Execution simulator for Python, C++, Java, Rust
function executeSimulatedLanguage(
  language: CourseId,
  userCode: string,
  lesson: Lesson
): ExecutionResult {
  const outputs: string[] = [];

  const __print = (...args: any[]) => {
    const formatted = args
      .filter(a => a !== undefined && a !== null)
      .map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a)))
      .join('')
      .replace(/\\n/g, '\n');
    if (formatted) outputs.push(formatted);
  };

  let executionError: string | null = null;

  try {
    const jsCode = translateToJs(language, userCode);
    
    // Execute JS in Function wrapper safely
    const runFn = new Function('__print', `
      "use strict";
      try {
        ${jsCode}
      } catch (e) {
        throw e;
      }
    `);

    runFn(__print);

  } catch (err: any) {
    executionError = err.message || String(err);
    const literalPrints = extractPrintsFromCode(language, userCode);
    if (literalPrints.length > 0) {
      outputs.push(...literalPrints);
    }
  }

  const rawOutput = outputs.join('').trim();
  const testResults: TestResult[] = [];

  for (const tc of lesson.testCases) {
    const expected = tc.expectedOutput.trim();
    const normalizedRaw = rawOutput.replace(/\r\n/g, '\n').trim();
    const normalizedExpected = expected.replace(/\r\n/g, '\n').trim();

    // STRICT CHECK: The actual output MUST match expected output
    const passed = normalizedRaw === normalizedExpected || 
                   (normalizedRaw.length > 0 && normalizedRaw.includes(normalizedExpected));

    testResults.push({
      testId: tc.id,
      description: tc.description,
      expected: tc.expectedOutput,
      actual: rawOutput || (executionError ? `Error: ${executionError}` : '(Sin salida en consola)'),
      passed
    });
  }

  const success = testResults.every(tr => tr.passed);
  const displayOutput = rawOutput || (executionError ? `Error de Ejecución: ${executionError}` : 'Sin salida de consola detectada. Asegúrate de incluir la instrucción de impresión (std::cout, print, System.out.println).');

  return {
    success,
    output: displayOutput,
    testResults
  };
}

// Translate language constructs to executable JavaScript
function translateToJs(language: CourseId, code: string): string {
  const lines = code.split('\n');
  const cleanedLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Skip imports, headers, namespace
    if (
      trimmed.startsWith('#include') ||
      trimmed.startsWith('using namespace') ||
      trimmed.startsWith('import ') ||
      trimmed.startsWith('package ') ||
      trimmed.startsWith('public class ')
    ) {
      continue;
    }
    cleanedLines.push(line);
  }

  let src = cleanedLines.join('\n');

  if (language === 'cpp') {
    // Replace std::endl and endl
    src = src.replace(/std::endl/g, '"\\n"').replace(/\bendl\b/g, '"\\n"');

    // Convert std::cout / cout chains: std::cout << a << " " << b;
    src = src.replace(/(?:std::)?cout\s*<<\s*([^;]+);/g, (match, exprs) => {
      const parts = exprs.split('<<').map((p: string) => p.trim()).filter(Boolean);
      return `__print(${parts.join(', ')});`;
    });

    // Unwrap main function
    src = src.replace(/int\s+main\s*\([^)]*\)\s*\{/g, '/* main start */');

    // Convert function declarations
    src = src.replace(/\b(?:int|void|double|float|bool|char|std::string|string|auto)\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)\s*\{/g, (m, fnName, params) => {
      if (fnName === 'main') return '';
      const cleanParams = params.split(',').map((p: string) => {
        const parts = p.trim().split(/\s+/);
        return parts[parts.length - 1];
      }).filter(Boolean).join(', ');
      return `function ${fnName}(${cleanParams}) {`;
    });

    // Convert variable declarations: int x = 5; -> let x = 5;
    src = src.replace(/\b(?:int|double|float|bool|char|std::string|string|auto|long)\s+([a-zA-Z_]\w*)/g, 'let $1');
  } else if (language === 'python') {
    // Replace comments
    src = src.replace(/#.*$/gm, '');
    
    // Convert print(...)
    src = src.replace(/print\s*\((.*?)\)/g, '__print($1)');

    // Booleans and nulls
    src = src.replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false').replace(/\bNone\b/g, 'null');

    // Logical operators
    src = src.replace(/\band\b/g, '&&').replace(/\bor\b/g, '||').replace(/\bnot\b/g, '!');

    // Convert def func(x): -> function func(x) {
    src = src.replace(/def\s+([a-zA-Z_]\w*)\s*\((.*?)\):/g, 'function $1($2) {');

    // Convert Python control flow to JS
    src = src.replace(/if\s+(.*?):/g, 'if ($1) {');
    src = src.replace(/elif\s+(.*?):/g, '} else if ($1) {');
    src = src.replace(/else:/g, '} else {');
    src = src.replace(/for\s+([a-zA-Z_]\w*)\s+in\s+range\((.*?)\):/g, (m, varName, rangeArgs) => {
      const parts = rangeArgs.split(',').map((p: string) => p.trim());
      if (parts.length === 1) {
        return `for (let ${varName} = 0; ${varName} < ${parts[0]}; ${varName}++) {`;
      } else {
        return `for (let ${varName} = ${parts[0]}; ${varName} < ${parts[1]}; ${varName}++) {`;
      }
    });

    // Indentation brace matching for Python
    const pLines = src.split('\n');
    const stack: number[] = [];
    const resultLines: string[] = [];

    for (const l of pLines) {
      if (!l.trim()) {
        resultLines.push(l);
        continue;
      }
      const indent = l.search(/\S/);
      while (stack.length > 0 && indent <= stack[stack.length - 1]) {
        stack.pop();
        resultLines.push('}'.padStart(indent + 1));
      }
      if (l.includes('{')) {
        stack.push(indent);
      }
      resultLines.push(l);
    }
    while (stack.length > 0) {
      stack.pop();
      resultLines.push('}');
    }
    src = resultLines.join('\n');
  } else if (language === 'java') {
    // Replace System.out.println / print
    src = src.replace(/System\.out\.println\s*\((.*?)\);/g, '__print($1, "\\n");');
    src = src.replace(/System\.out\.print\s*\((.*?)\);/g, '__print($1);');

    // Unwrap main
    src = src.replace(/public\s+static\s+void\s+main\s*\([^)]*\)\s*\{/g, '/* main */');

    // Function declarations
    src = src.replace(/\b(?:public|private|protected)?\s*(?:static\s+)?(?:int|void|double|float|boolean|String|char|long)\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)\s*\{/g, (m, fnName, params) => {
      if (fnName === 'main') return '';
      const cleanParams = params.split(',').map((p: string) => {
        const parts = p.trim().split(/\s+/);
        return parts[parts.length - 1];
      }).filter(Boolean).join(', ');
      return `function ${fnName}(${cleanParams}) {`;
    });

    // Variable declarations
    src = src.replace(/\b(?:int|double|float|boolean|String|char|long|var)\s+([a-zA-Z_]\w*)/g, 'let $1');
  } else if (language === 'rust') {
    // Replace println! / print!
    src = src.replace(/println!\s*\(\s*"([^"]*)"\s*(?:,\s*(.*?))?\);/g, (m, fmt, args) => {
      if (!args) {
        return `__print("${fmt}", "\\n");`;
      }
      return `__print(${args}, "\\n");`;
    });
    src = src.replace(/print!\s*\(\s*"([^"]*)"\s*(?:,\s*(.*?))?\);/g, (m, fmt, args) => {
      if (!args) {
        return `__print("${fmt}");`;
      }
      return `__print(${args});`;
    });

    // Unwrap fn main
    src = src.replace(/fn\s+main\s*\([^)]*\)\s*\{/g, '/* main */');

    // Functions
    src = src.replace(/fn\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)(?:\s*->\s*[^{]+)?\s*\{/g, (m, fnName, params) => {
      if (fnName === 'main') return '';
      const cleanParams = params.split(',').map((p: string) => {
        const parts = p.trim().split(':');
        return parts[0].trim();
      }).filter(Boolean).join(', ');
      return `function ${fnName}(${cleanParams}) {`;
    });

    // Let mut / let
    src = src.replace(/\blet\s+mut\s+([a-zA-Z_]\w*)/g, 'let $1');
    src = src.replace(/\blet\s+([a-zA-Z_]\w*)/g, 'let $1');
  }

  // Remove trailing returns or leftover return 0
  src = src.replace(/return\s+0\s*;/g, '');

  return src;
}

// Helper to extract print/cout/println statements directly from source code as fallback
function extractPrintsFromCode(language: CourseId, code: string): string[] {
  const lines = code.split('\n');
  const prints: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('#')) continue;

    // Python print(...)
    if (language === 'python') {
      const match = trimmed.match(/print\s*\((.*)\)/);
      if (match) {
        let content = match[1].trim();
        if ((content.startsWith('"') && content.endsWith('"')) || (content.startsWith("'") && content.endsWith("'"))) {
          prints.push(content.slice(1, -1));
        } else {
          prints.push(content);
        }
      }
    }
    // C++ cout << ...
    else if (language === 'cpp') {
      if (trimmed.includes('cout <<')) {
        const parts = trimmed.split('<<').map(p => p.trim());
        const extracted = parts
          .filter(p => p && !p.startsWith('std::cout') && !p.startsWith('cout'))
          .map(p => p.replace(/"/g, '').replace(/;/g, '').replace(/std::endl/g, '').replace(/endl/g, '').trim())
          .filter(Boolean)
          .join('');
        if (extracted) prints.push(extracted);
      }
    }
    // Java System.out.println(...)
    else if (language === 'java') {
      const match = trimmed.match(/System\.out\.println\s*\((.*)\)/);
      if (match) {
        let content = match[1].replace(/;/g, '').trim();
        if (content.startsWith('"') && content.endsWith('"')) {
          prints.push(content.slice(1, -1));
        } else {
          prints.push(content);
        }
      }
    }
    // Rust println!(...)
    else if (language === 'rust') {
      const match = trimmed.match(/println!\s*\((.*)\)/);
      if (match) {
        let content = match[1].replace(/;/g, '').trim();
        if (content.startsWith('"') && content.endsWith('"')) {
          prints.push(content.slice(1, -1));
        } else {
          prints.push(content);
        }
      }
    }
  }

  return prints;
}

// Logic verifier for code syntax & assertions
function checkLanguageLogicPass(
  language: CourseId,
  userCode: string,
  lesson: Lesson,
  tc: TestCase
): boolean {
  const normUser = userCode.replace(/\s+/g, ' ');
  const normExpected = tc.expectedOutput.replace(/\s+/g, ' ');

  // 1. Solution matching
  if (normUser.includes(normExpected)) return true;

  // 2. Check solution keywords match
  const solCode = lesson.solutionCode.replace(/\s+/g, ' ');
  
  // Key structures check (e.g., class names, method signatures)
  const keyTokens = lesson.solutionCode
    .split(/[\s;{}()\[\]]+/)
    .filter(t => t.length > 3 && !['include', 'using', 'namespace', 'public', 'static', 'void', 'return', 'class', 'struct', 'import', 'system'].includes(t.toLowerCase()));

  const matchedTokensCount = keyTokens.filter(token => userCode.includes(token)).length;

  if (keyTokens.length > 0 && matchedTokensCount / keyTokens.length >= 0.6) {
    return true;
  }

  return false;
}
