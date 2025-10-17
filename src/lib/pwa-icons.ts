import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

/**
 * Gera ícones PWA dinâmicos baseados na logo personalizada do usuário
 */
export class PWAIconGenerator {
  private static readonly ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
  private static readonly ICONS_DIR = join(process.cwd(), "public", "icons");

  /**
   * Gera ícones PWA a partir de uma imagem
   */
  static async generateIconsFromImage(imagePath: string, userId: string): Promise<string[]> {
    try {
      // Criar diretório se não existir
      if (!existsSync(this.ICONS_DIR)) {
        await mkdir(this.ICONS_DIR, { recursive: true });
      }

      const generatedIcons: string[] = [];

      // Para cada tamanho, criar um ícone
      for (const size of this.ICON_SIZES) {
        const iconPath = await this.createIconFromImage(imagePath, size, userId);
        if (iconPath) {
          generatedIcons.push(iconPath);
        }
      }

      return generatedIcons;
    } catch (error) {
      console.error("Erro ao gerar ícones PWA:", error);
      return [];
    }
  }

  /**
   * Cria um ícone de tamanho específico a partir de uma imagem
   */
  private static async createIconFromImage(
    imagePath: string, 
    size: number, 
    userId: string
  ): Promise<string | null> {
    try {
      // Para simplificar, vamos usar uma abordagem que redimensiona a imagem
      // Em produção, você pode usar bibliotecas como 'sharp' para melhor qualidade
      
      const iconName = `icon-${size}x${size}-${userId}.png`;
      const iconPath = join(this.ICONS_DIR, iconName);
      
      // Por enquanto, vamos criar um placeholder
      // Em produção, implemente o redimensionamento real da imagem
      await this.createPlaceholderIcon(iconPath, size);
      
      return `/icons/${iconName}`;
    } catch (error) {
      console.error(`Erro ao criar ícone ${size}x${size}:`, error);
      return null;
    }
  }

  /**
   * Cria um ícone placeholder (temporário)
   * Em produção, substitua por redimensionamento real da imagem
   */
  private static async createPlaceholderIcon(iconPath: string, size: number): Promise<void> {
    // Criar um SVG simples como placeholder
    const svg = `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="#3b82f6" rx="${size * 0.1}"/>
        <text x="50%" y="50%" text-anchor="middle" dy="0.35em" fill="white" font-family="Arial, sans-serif" font-size="${size * 0.3}" font-weight="bold">
          FU
        </text>
      </svg>
    `;

    await writeFile(iconPath, svg);
  }

  /**
   * Atualiza o manifest.json com os novos ícones
   */
  static async updateManifestWithIcons(iconPaths: string[], _userId: string): Promise<void> {
    try {
      const manifestPath = join(process.cwd(), "public", "manifest.json");
      
      // Ler manifest atual
      const manifest = JSON.parse(await import("fs").then(fs => 
        fs.promises.readFile(manifestPath, "utf-8")
      ));

      // Atualizar ícones
      manifest.icons = iconPaths.map((path, index) => ({
        src: path,
        sizes: `${this.ICON_SIZES[index]}x${this.ICON_SIZES[index]}`,
        type: "image/png",
        purpose: "maskable any"
      }));

      // Salvar manifest atualizado
      await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    } catch (error) {
      console.error("Erro ao atualizar manifest:", error);
    }
  }

  /**
   * Remove ícones antigos do usuário
   */
  static async cleanupOldIcons(userId: string): Promise<void> {
    try {
      const fs = await import("fs");
      const files = await fs.promises.readdir(this.ICONS_DIR);
      
      for (const file of files) {
        if (file.includes(`-${userId}.png`)) {
          await fs.promises.unlink(join(this.ICONS_DIR, file));
        }
      }
    } catch (error) {
      console.error("Erro ao limpar ícones antigos:", error);
    }
  }
}
