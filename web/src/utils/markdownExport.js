import { getNormalErrorAlert, getNormalSuccessAlert } from '@/utils/other';

export function getMarkdownFilename(title) {
  const sanitized = String(title || 'article').replace(/[\\/:*?"<>|]/g, '_').trim().slice(0, 100);
  return `${sanitized || 'article'}.md`;
}

export async function copyMarkdownContent(content, alert) {
  if (!content) {
    alert?.(getNormalErrorAlert('暂无 Markdown 内容'));
    return false;
  }
  try {
    await navigator.clipboard.writeText(content);
    alert?.(getNormalSuccessAlert('Markdown 已复制'));
    return true;
  } catch {
    alert?.(getNormalErrorAlert('复制失败，请检查浏览器权限'));
    return false;
  }
}

export function downloadMarkdownContent(content, title, alert) {
  if (!content) {
    alert?.(getNormalErrorAlert('暂无 Markdown 内容'));
    return false;
  }
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = getMarkdownFilename(title);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  alert?.(getNormalSuccessAlert('下载已开始'));
  return true;
}
