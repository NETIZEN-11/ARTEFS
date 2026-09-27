# frozen_string_literal: true

require 'json'

##
# Invokes a class method by name ("ClassName.method_name" format).
# @param [String] qualified_name - Name in "ClassName.method_name" format.
# @param [Array<Object>] args - Arguments to pass to the invoked method.
# @return [Object] The value returned by the invoked method.
def invoke_class_method(qualified_name, *args)
  class_name, method_name_part = qualified_name.split('.', 2)
  klass = Object.const_get(class_name)
  klass.public_send(method_name_part, *args)
end

##
# Loads the Ruby script at the given path and invokes the named method from that script.
# If `method_name` contains a dot (`ClassName.method`), the class constant is resolved and the
# class method is invoked; otherwise a top-level method is invoked.
# @param [String] script_path - Path to the Ruby script file to load.
# @param [String] method_name - Name of the method to call; use `ClassName.method` to call a class method.
# @param [Array<Object>] args - Arguments to pass to the invoked method.
# @return [Object] The value returned by the invoked method.
def call_method(script_path, method_name, *args)
  script_dir = File.dirname(File.absolute_path(script_path))
  $LOAD_PATH.unshift(script_dir) unless $LOAD_PATH.include?(script_dir)
  puts "Loading script #{script_path} ..."
  load script_path
  if method_name.include?('.')
    invoke_class_method(method_name, *args)
  else
    send(method_name, *args)
  end
end

if __FILE__ == $PROGRAM_NAME
  script_path = ARGV[0]
  method_name = ARGV[1]
  json_path = ARGV[2]
  output_path = ARGV[3]

  data = JSON.parse(File.read(json_path, encoding: 'utf-8'))

  result = call_method(script_path, method_name, *data)

  File.write(output_path, JSON.generate({ type: 'final_result', data: result }), encoding: 'utf-8')
end
