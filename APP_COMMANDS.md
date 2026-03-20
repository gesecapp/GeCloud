### Faça build

pnpm run build

### Syncronize com o Capacitor

npx cap sync

### Abra o projeto no Xcode

npx cap open ios

### Abra o projeto no Android

npx cap open android

- Gere os ícones e splash screens

`npx @capacitor/assets generate --iconBackgroundColor '#fff' --iconBackgroundColorDark '#fff' --splashBackgroundColor '#fff' --splashBackgroundColorDark '#fff'`

### Capgo Native Builds (Cloud)

Você pode solicitar builds nativos no cloud usando o Capgo. Isso é útil para gerar APK/AAB ou pacotes iOS sem precisar de um Mac/Android Studio local configurado para build final.

- **Configurar Credenciais (Primeira vez ou atualização)**

  ```bash
  pnpm run capgo:cred:save
  ```

- **Solicitar Build iOS**

  ```bash
  pnpm run capgo:build:ios
  ```

- **Solicitar Build Android**
  ```bash
  pnpm run capgo:build:android
  ```

> [!NOTE]
> As credenciais são salvas localmente pelo CLI do Capgo e não são enviadas para o repositório.
