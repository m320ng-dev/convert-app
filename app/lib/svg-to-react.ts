const attributeMap: Record<string, string> = {
  class: 'className',
  'clip-rule': 'clipRule',
  'fill-opacity': 'fillOpacity',
  'fill-rule': 'fillRule',
  'font-family': 'fontFamily',
  'font-size': 'fontSize',
  'stroke-dasharray': 'strokeDasharray',
  'stroke-dashoffset': 'strokeDashoffset',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'stroke-opacity': 'strokeOpacity',
  'stroke-width': 'strokeWidth',
  'stop-color': 'stopColor',
  'stop-opacity': 'stopOpacity',
  'text-anchor': 'textAnchor',
};

export function convertSvgToReactComponent(svg: string, componentName: string): string {
  if (!svg.trim()) {
    return '';
  }

  const resolvedComponentName = normalizeComponentName(componentName);
  const jsx = toReactSvgMarkup(svg);

  return `import type { SVGProps } from 'react';

export function ${resolvedComponentName}(props: SVGProps<SVGSVGElement>) {
  return (
    ${jsx.replace(/\n/g, '\n    ')}
  );
}
`;
}

function toReactSvgMarkup(svg: string): string {
  if (!/<svg[\s>]/i.test(svg)) {
    throw new Error('유효한 SVG 마크업을 입력해주세요.');
  }

  return Object.entries(attributeMap).reduce(
    (current, [htmlName, reactName]) => current.replace(new RegExp(`${htmlName}=`, 'g'), `${reactName}=`),
    svg.trim(),
  );
}

function normalizeComponentName(value: string): string {
  const normalized = value.trim().replace(/[^A-Za-z0-9_$]/g, '');

  if (/^[A-Z][A-Za-z0-9_$]*$/.test(normalized)) {
    return normalized;
  }

  return 'SvgIcon';
}
