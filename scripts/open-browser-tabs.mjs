// Aguarda o servidor da Pastifico API ficar disponível e então abre as telas
// principais (cliente, cozinha e status do pedido) no navegador externo
// padrão do sistema operacional. Usado pela configuração de depuração
// "Pastifico (servidor + 3 abas)" no .vscode/launch.json.
import { exec } from 'node:child_process';
import http from 'node:http';

const port = process.env.PORT || 3000;
const urls = [
  `http://localhost:${port}/`,
  `http://localhost:${port}/kitchen-dashboard`,
  `http://localhost:${port}/order-status`
];

const waitForServer = (timeoutMs = 60000, intervalMs = 300) => new Promise((resolve, reject) => {
  const startedAt = Date.now();

  const check = () => {
    const request = http.get(`http://localhost:${port}/api/health`, (response) => {
      response.resume();
      resolve();
    });

    request.on('error', () => {
      if (Date.now() - startedAt > timeoutMs) {
        reject(new Error('Tempo esgotado aguardando o servidor da Pastifico API iniciar.'));
        return;
      }
      setTimeout(check, intervalMs);
    });
  };

  check();
});

const openUrl = (url) => {
  const platform = process.platform;
  const command = platform === 'win32'
    ? `start "" "${url}"`
    : platform === 'darwin'
      ? `open "${url}"`
      : `xdg-open "${url}"`;

  exec(command, platform === 'win32' ? { shell: 'cmd.exe' } : undefined);
};

try {
  await waitForServer();

  for (const url of urls) {
    openUrl(url);
    // Pequena pausa entre aberturas para evitar que o navegador agrupe/ignore aberturas simultâneas.
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => setTimeout(resolve, 400));
  }

  console.log(`Abertas ${urls.length} abas no navegador externo.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
