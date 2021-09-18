/**
 * Bit Flag Implementation for File.kind
 *
 * @example
 * const isHidden: boolean = (file.kind & VirtualFileKind.Hidden) === VirtualFileKind.Hidden
 * const isDirectory: boolean = (file.kind & VirtualFileKind.Directory) === VirtualFileKind.Directory
 */
export enum VirtualFileKind {
  File = 0,
  Directory = 1,

  System = 2,
  Hidden = 4,

  Remote = 8
}
